from psutil import Process, cpu_percent
from threading import Thread
import time
import weakref
from typing import Union

from aim.ext.resource.stat import Stat
from aim.ext.resource.configs import AIM_RESOURCE_METRIC_PREFIX


class ResourceTracker(object):
    STAT_INTERVAL_MIN = 0.1
    STAT_INTERVAL_MAX = 24 * 60 * 60.0
    STAT_INTERVAL_DEFAULT = 60.0

    reset_cpu_cycle = False

    @staticmethod
    def reset_proc_interval():
        """
        Calls process `cpu_percent` which resets cpu utilization tracking cycle
        Read more: https://psutil.readthedocs.io/en/latest/#psutil.cpu_percent
        """
        cpu_percent(0.0)

    def __init__(self, track, interval: Union[int, float] = STAT_INTERVAL_DEFAULT):
        self._track_func = weakref.WeakMethod(track)
        self.interval = interval

        try:
            self._process = Process()
        except Exception:
            self._process = None

        # Start thread to collect stats at interval
        self._th_collector = Thread(target=self._stat_collector, daemon=True)
        self._shutdown = False
        self._started = False

        if ResourceTracker.reset_cpu_cycle is False:
            ResourceTracker.reset_cpu_cycle = True
            self.reset_proc_interval()

    @property
    def interval(self):
        return self._interval

    @interval.setter
    def interval(self, interval: float):
        if self.STAT_INTERVAL_MIN <= interval <= self.STAT_INTERVAL_MAX:
            self._interval = interval
        else:
            raise ValueError(('interval must be greater than {min}s and less '
                              'than {max}m'
                              '').format(min=self.STAT_INTERVAL_MIN,
                                         max=self.STAT_INTERVAL_MAX / 60))

    def start(self):
        """
        Start statistics collection
        """
        if self._started:
            return

        self._started = True

        # Start thread to asynchronously collect statistics
        self._th_collector.start()

    def stop(self):
        if not self._started:
            return

        self._shutdown = True
        self._th_collector.join()

    def _track(self, stat: Stat):
        # Store system stats
        for resource, usage in stat.system.items():
            self._track_func()(
                usage,
                name='{}{}'.format(AIM_RESOURCE_METRIC_PREFIX, resource),
            )

        # Store GPU stats
        for gpu_idx, gpu in enumerate(stat.gpus):
            for resource, usage in gpu.items():
                self._track_func()(
                    usage,
                    name='{}{}'.format(AIM_RESOURCE_METRIC_PREFIX, resource),
                    context={'gpu': gpu_idx}
                )

    def _stat_collector(self):
        """
       Statistics collecting thread body
       """
        while True:
            # Get system statistics
            stat = Stat(self._process)
            if self._shutdown:
                break

            self._track(stat)

            time_counter = 0
            while time_counter < self.interval:
                time.sleep(0.1)
                time_counter += 0.1
                if self._shutdown:
                    break
