import time
import psutil
import json


class Stat:
    # Available aggregate functions
    AGG_MODE_AVG = 'average'
    AGG_MODE_MIN = 'min'
    AGG_MODE_MAX = 'max'
    AGG_MODE_DIFF = 'diff'
    AGG_DEFAULT = AGG_MODE_AVG

    # Current running process
    _process = None

    @classmethod
    def set_process(cls, process):
        if cls._process is None or cls._process != process:
            cls._process = process

    @classmethod
    def reset_proc_interval(cls):
        cls._process.cpu_percent(0.0)

    @classmethod
    def aggregate(cls, items, mode):
        if mode == cls.AGG_MODE_MAX:
            return max(items)
        elif mode == cls.AGG_MODE_MIN:
            return min(items)
        elif mode == cls.AGG_MODE_AVG:
            return sum(items) / len(items)
        elif mode == cls.AGG_MODE_DIFF:
            return max(items) - min(items)
        return 0

    @classmethod
    def aggregate_items(cls, items, agg_mode=None, agg_exec_time=False):
        if not items:
            return Stat()

        if not agg_mode:
            agg_mode = cls.AGG_DEFAULT

        aggregated_stat = cls()
        for s in items:
            for k in s.system.keys():
                aggregated_stat.system.setdefault(k, [])
                aggregated_stat.system[k].append(s.system[k])

        for k in aggregated_stat.system.keys():
            aggregated_stat.system[k] = cls.aggregate(aggregated_stat.system[k],
                                                      agg_mode)

        if agg_exec_time:
            exec_times = [s.op_exec_time for s in items]
            aggregated_stat.op_exec_time = cls.aggregate(exec_times,
                                                         cls.AGG_DEFAULT)
        else:
            exec_times = [s.time for s in items]
            aggregated_stat.op_exec_time = cls.aggregate(exec_times,
                                                         cls.AGG_MODE_DIFF)

        return aggregated_stat

    def __init__(self, process=None):
        if process is not None:
            self.set_process(process)

        self.time = time.perf_counter()
        self.op_exec_time = 0
        self.system = {}
        self.gpu = []

    def set_stats(self):
        memory_usage = psutil.virtual_memory()
        # disk_usage = psutil.disk_usage('/')
        self.system = {
            'cpu': self._process.cpu_percent(0.0),
            'p_memory_rss': self._process.memory_info().rss / 1024 / 1024,
            'p_memory_percent': self._process.memory_percent(),
            'memory_used': memory_usage.used / 1024 / 1024,
            'memory_percent': (memory_usage.used * 100) / memory_usage.total,
        }

        # Collect GPU statistics
        # gpu_stats = []
        # try:
        #     import pynvml
        #     pynvml.nvmlInit()
        #
        #     for i in range(pynvml.nvmlDeviceGetCount()):
        #         handle = pynvml.nvmlDeviceGetHandleByIndex(i)
        #
        #         util = pynvml.nvmlDeviceGetUtilizationRates(handle)
        #         memory = pynvml.nvmlDeviceGetMemoryInfo(handle)
        #         temp = pynvml.nvmlDeviceGetTemperature(handle,
        #                                                pynvml.NVML_TEMPERATURE_GPU)
        #
        #         power_watts = pynvml.nvmlDeviceGetPowerUsage(handle) / 1000
        #         power_cap = pynvml.nvmlDeviceGetEnforcedPowerLimit(handle)
        #         power_cap_watts = power_cap / 1000
        #         power_usage = power_watts / power_cap_watts * 100
        #
        #         gpu_stats[i] = {
        #             'gpu': util.gpu,
        #             'memory_total': memory.total,
        #             'memory_free': memory.total - memory.used,
        #             'power_watts': power_watts,
        #             'power_percent': power_usage,
        #             'temp': temp,
        #         }
        # except Exception:
        #     pass

    def to_dict(self):
        system_stats = self.system
        if system_stats:
            system_stats.update({
                'time': self.op_exec_time,
            })

        return system_stats

    def __str__(self):
        return json.dumps(self.to_dict())
