import psutil
import json
from typing import List

import aim._ext.system_info.pynvml as nvml


class StatDict(object):
    # Available aggregation functions
    AGG_MODE_AVG = 'average'
    AGG_MODE_MIN = 'min'
    AGG_MODE_MAX = 'max'
    AGG_MODE_DIFF = 'diff'
    AGG_DEFAULT = AGG_MODE_AVG

    @classmethod
    def aggregate(cls, items: List, mode: str):
        """
        Aggregates array of numbers by a given 'mode'
        """
        if mode == cls.AGG_MODE_MAX:
            return max(items)
        elif mode == cls.AGG_MODE_MIN:
            return min(items)
        elif mode == cls.AGG_MODE_AVG:
            return round10e5(sum(items) / len(items))
        elif mode == cls.AGG_MODE_DIFF:
            return round10e5(max(items) - min(items))
        else:
            raise ValueError('unknown aggregation mode: \'{}\''.format(mode))

    @classmethod
    def aggregate_items(cls,
                        items: 'List[StatDict]',
                        agg_mode: str = AGG_DEFAULT,
                        ):
        """
        Aggregates array of `StatDict` items by a given `mode`
        """
        aggregated_stat = cls()

        # Return empty item if items array is empty
        if not items or len(items) == 0:
            return aggregated_stat

        gpu_stats = []
        for s in items:
            # Collect system stats
            for k in s.system.keys():
                aggregated_stat.system.setdefault(k, [])
                aggregated_stat.system[k].append(s.system[k])

            # Collect GPU device stats
            for stat_item_gpu_idx in range(len(s.gpus)):
                stat_item_gpu_stat = s.gpus[stat_item_gpu_idx]
                if len(gpu_stats) == stat_item_gpu_idx:
                    gpu_stats.append({})
                for gpu_stat_key in stat_item_gpu_stat.keys():
                    gpu_stat = stat_item_gpu_stat[gpu_stat_key]
                    gpu_stats[stat_item_gpu_idx].setdefault(gpu_stat_key, [])
                    gpu_stats[stat_item_gpu_idx][gpu_stat_key].append(gpu_stat)

        # Aggregate system stats
        for k in aggregated_stat.system.keys():
            aggregated_stat.system[k] = cls.aggregate(aggregated_stat.system[k],
                                                      agg_mode)

        # Aggregate GPU device stats
        for g in range(len(gpu_stats)):
            for k in gpu_stats[g].keys():
                gpu_stats[g][k] = cls.aggregate(gpu_stats[g][k], agg_mode)
        aggregated_stat.gpu = gpu_stats

        return aggregated_stat

    def __init__(self, system: dict = None, gpus: List[dict] = None):
        self.system = system or {}
        self.gpus = gpus or []

    def __str__(self):
        return json.dumps(self.to_dict())

    def to_dict(self):
        """
        Returns system and GPU device statistics
        """
        return {
            'system': self.system,
            'gpus': self.gpus,
        }


class Stat(object):
    def __init__(self, process):
        # Set process
        self._process = process

        # Get statistics
        system, gpus = self.get_stats()
        self._stat = StatDict(system, gpus)

    @property
    def process(self):
        return self._process

    @property
    def stat_item(self):
        return self._stat

    @property
    def system(self):
        return self._stat.system

    @property
    def gpus(self):
        return self._stat.gpus

    def get_stats(self):
        """
        Get system statistics and assign to `self`
        """
        memory_usage = psutil.virtual_memory()
        disk_usage = psutil.disk_usage('/')
        # net = psutil.net_io_counters()
        system = {
            # CPU utilization percent(can be over 100%)
            'cpu': round10e5(self._process.cpu_percent(0.0)),

            # Whole system memory usage
            # 'memory_used': round10e5(memory_usage.used / 1024 / 1024),
            'memory_percent': round10e5(memory_usage.used * 100 / memory_usage.total),

            # Get the portion of memory occupied by a process
            # 'p_memory_rss': round10e5(self._process.memory_info().rss
            #                           / 1024 / 1024),
            'p_memory_percent': round10e5(self._process.memory_percent()),

            # Disk usage
            # 'disk_used': round10e5(disk_usage.used / 1024 / 1024),
            'disk_percent': round10e5(disk_usage.percent),
        }

        # Collect GPU statistics
        gpus = []
        try:
            nvml.nvmlInit()
            gpu_device_count = nvml.nvmlDeviceGetCount()
            for i in range(gpu_device_count):
                gpu_info = dict()
                handle = nvml.nvmlDeviceGetHandleByIndex(i)
                try:
                    util = nvml.nvmlDeviceGetUtilizationRates(handle)
                    # GPU utilization percent
                    gpu_info["gpu"] = round10e5(util.gpu)
                except nvml.NVMLError_NotSupported:
                    pass
                try:
                    # Get device memory
                    memory = nvml.nvmlDeviceGetMemoryInfo(handle)
                    # Device memory usage
                    # 'memory_used': round10e5(memory.used / 1024 / 1024),
                    gpu_info["gpu_memory_percent"] = round10e5(memory.used * 100 / memory.total)
                except nvml.NVMLError_NotSupported:
                    pass
                try:
                    # Get device temperature
                    nvml_tmp = nvml.NVML_TEMPERATURE_GPU
                    temp = nvml.nvmlDeviceGetTemperature(handle, nvml_tmp)
                    # Device temperature
                    gpu_info["gpu_temp"] = round10e5(temp)
                except nvml.NVMLError_NotSupported:
                    pass
                try:
                    # Compute power usage in watts and percent
                    power_watts = nvml.nvmlDeviceGetPowerUsage(handle) / 1000
                    power_cap = nvml.nvmlDeviceGetEnforcedPowerLimit(handle)
                    power_cap_watts = power_cap / 1000
                    power_watts / power_cap_watts * 100
                    # Power usage in watts and percent
                    gpu_info["gpu_power_watts"]: round10e5(power_watts)
                    # gpu_info["power_percent"] = round10e5(power_usage)
                except nvml.NVMLError_NotSupported:
                    pass
                gpus.append(gpu_info)
            nvml.nvmlShutdown()
        except (nvml.NVMLError_LibraryNotFound, nvml.NVMLError_NotSupported):
            pass

        return system, gpus


def round10e5(val):
    return round(val * 10e5) / 10e5
