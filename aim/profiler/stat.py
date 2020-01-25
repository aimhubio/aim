import time
import psutil
import json


try:
    from py3nvml import py3nvml as nvml
    nvml.nvmlInit()
except Exception:
    pass


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
            return cls.round(sum(items) / len(items))
        elif mode == cls.AGG_MODE_DIFF:
            return cls.round(max(items) - min(items))
        return 0

    @classmethod
    def aggregate_items(cls, items, agg_mode=None, agg_exec_time=False):
        if not items:
            return Stat()

        if not agg_mode:
            agg_mode = cls.AGG_DEFAULT

        aggregated_stat = cls()
        gpu_stats = []
        for s in items:
            # Collect system stats
            for k in s.system.keys():
                aggregated_stat.system.setdefault(k, [])
                aggregated_stat.system[k].append(s.system[k])

            # Collect GPU stats
            for stat_item_gpu_idx in range(len(s.gpu)):
                stat_item_gpu_stat = s.gpu[stat_item_gpu_idx]
                if len(gpu_stats) == stat_item_gpu_idx:
                    gpu_stats.append({})
                for gpu_stat_key in stat_item_gpu_stat.keys():
                    gpu_stat_val = stat_item_gpu_stat[gpu_stat_key]
                    gpu_stats[stat_item_gpu_idx].setdefault(gpu_stat_key, [])
                    gpu_stats[stat_item_gpu_idx][gpu_stat_key].append(gpu_stat_val)

        # Aggregate system stats
        for k in aggregated_stat.system.keys():
            aggregated_stat.system[k] = cls.aggregate(aggregated_stat.system[k],
                                                      agg_mode)

        # Aggregate GPU stats
        for g in range(len(gpu_stats)):
            for k in gpu_stats[g].keys():
                gpu_stats[g][k] = cls.aggregate(gpu_stats[g][k],
                                                agg_mode)
        aggregated_stat.gpu = gpu_stats

        # Compute or get execution time average
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
        self.system = {
            'cpu': self.round(self._process.cpu_percent(0.0)),
            'p_memory_rss': self.round(self._process.memory_info().rss / 1024 / 1024),
            'p_memory_percent': self.round(self._process.memory_percent()),
            'memory_used': self.round(memory_usage.used / 1024 / 1024),
            'memory_percent': self.round(memory_usage.used * 100
                                         / memory_usage.total),
        }

        # Collect GPU statistics
        try:
            for i in range(nvml.nvmlDeviceGetCount()):
                handle = nvml.nvmlDeviceGetHandleByIndex(i)
                nvml_tmp = nvml.NVML_TEMPERATURE_GPU

                util = nvml.nvmlDeviceGetUtilizationRates(handle)
                memory = nvml.nvmlDeviceGetMemoryInfo(handle)
                temp = nvml.nvmlDeviceGetTemperature(handle, nvml_tmp)

                power_watts = nvml.nvmlDeviceGetPowerUsage(handle) / 1000
                power_cap = nvml.nvmlDeviceGetEnforcedPowerLimit(handle)
                power_cap_watts = power_cap / 1000
                power_usage = power_watts / power_cap_watts * 100

                self.gpu.append({
                    'gpu': self.round(util.gpu),
                    'memory_used': self.round(memory.used / 1024 / 1024),
                    'memory_percent': self.round(memory.used * 100
                                                 / memory.total),
                    'power_watts': self.round(power_watts),
                    'power_percent': self.round(power_usage),
                    'temp': self.round(temp),
                })
        except Exception:
            pass

    def round(self, val):
        return round(val * 100000) / 100000

    def to_dict(self):
        system_stats = self.system
        if system_stats:
            system_stats.update({
                'time': self.op_exec_time,
            })

        return system_stats, self.gpu

    def __str__(self):
        return json.dumps(self.to_dict())
