import time
import psutil
import threading
from collections import OrderedDict

from aim.sdk.track import track
from aim.engine.types import Singleton
from aim.profiler.stat import Stat


class Profiler(metaclass=Singleton):
    STAT_INTERVAL_MIN = 5
    STAT_INTERVAL_MAX = 500
    STAT_INTERVAL_DEFAULT = 10
    STAT_SEC_INTERVAL_DEFAULT = 5
    SQUASH_AMOUNT = 10

    def __init__(self):
        # Statistics collection interval
        self._interval = self.STAT_INTERVAL_DEFAULT

        # Minimum interval in seconds that must be passed
        # before squashing collected cycles
        self._sec_interval = self.STAT_SEC_INTERVAL_DEFAULT

        # Minimum amount of cycles that must be recorded
        # before squashing collected cycles
        self._squash = self.SQUASH_AMOUNT

        self.last_squash_timestamp = 0
        self.cycle_index = 0
        self.cycles = []

        self.curr_cycle_keys = []
        self.curr_cycle_tracked_keys = []
        self.curr_cycle = OrderedDict()
        self.cycle_write_lock = threading.Lock()

        # Set current running process
        try:
            self._process = psutil.Process()
            Stat.set_process(self._process)
        except Exception:
            self._process = None

        # Start thread to collect stats at interval
        self._shutdown = False
        stat_collector = threading.Thread(target=self._stat_collector,
                                          daemon=True)
        stat_collector.start()
        self._thread = stat_collector

    @property
    def squash(self):
        return self._squash

    @squash.setter
    def squash(self, squash):
        if squash is None:
            self._squash = self.SQUASH_AMOUNT
        elif isinstance(squash, int) and squash >= 1:
            self._squash = int(squash)

    @property
    def interval(self):
        return self._interval

    @interval.setter
    def interval(self, interval: float):
        if self.STAT_INTERVAL_MIN <= interval <= self.STAT_INTERVAL_MAX:
            self._interval = interval

    @property
    def sec_interval(self):
        return self._sec_interval

    @sec_interval.setter
    def sec_interval(self, interval: float):
        if 0.1 <= interval <= 60 * 60:
            self._sec_interval = interval

    def track(self, key):
        """
        Signal collector-thread to start storing statistics under
        `curr_cycle[key]`. Aggregate collected stat records if
        conditions are met
        """
        # Acquire lock to tell other threads to wait until aggregation process
        # is done
        self.cycle_write_lock.acquire()

        # Check if cycle is done and append it to the cycles storage
        if key in self.curr_cycle_keys and key == self.curr_cycle_keys[0]:
            agg_cycle = {}
            for k, cycle_stats in self.curr_cycle.items():
                agg_cycle[k] = Stat.aggregate_items(cycle_stats,
                                                    Stat.AGG_MODE_AVG,
                                                    False)

            self.cycles.append(agg_cycle)
            self.cycle_index += 1
            self.curr_cycle_keys = []
            self.curr_cycle = OrderedDict()

            # Squash cycles to get higher accuracy and save space
            squash_cycles = self.cycle_index >= self.squash
            if squash_cycles:
                squash_cycles = (time.time() - self.last_squash_timestamp
                                 >= self.sec_interval)

            if squash_cycles:
                self.last_squash_timestamp = time.time()

                squashed_cycles = {}
                for cycle in self.cycles:
                    for k in cycle.keys():
                        squashed_cycles.setdefault(k, [])
                        squashed_cycles[k].append(cycle[k])

                # Squash cycles
                sys_stats = {}
                gpu_stats = []
                for k in squashed_cycles.keys():
                    sys, gpu = Stat.aggregate_items(squashed_cycles[k],
                                                    Stat.AGG_MODE_AVG,
                                                    True).to_dict()
                    sys_stats[k] = sys
                    for g in range(len(gpu)):
                        if g == len(gpu_stats):
                            gpu_stats.append({})
                        gpu_stats[g][k] = gpu[g]

                # Add records to `.aim` repo
                track('Stats', 'system', sys_stats)
                for g in range(len(gpu_stats)):
                    gpu_stat_key = 'gpu_{}'.format(g)
                    track('Stats', gpu_stat_key, gpu_stats[g])

                # Empty profiler state
                self.cycle_index = 0
                self.cycles = []

        # Reset process interval
        Stat.reset_proc_interval()

        # Add `key` to current cycle and to array of tracked keys
        self.curr_cycle.update({key: []})
        self.curr_cycle_tracked_keys.append(key)
        self.curr_cycle_keys.append(key)

        # Release cycle memory lock
        self.cycle_write_lock.release()

    def cycle(self, key):
        """
        Stop storing statistics under key
        """
        # Acquire lock to tell other threads to wait until
        # removal of keys is done and process can be continued
        self.cycle_write_lock.acquire()

        if key not in self.curr_cycle or \
                key not in self.curr_cycle_tracked_keys:
            print('Label \'{}\' was not set'.format(key))
            return

        # Remove `key` from array of tracked keys
        self.curr_cycle_tracked_keys.remove(key)

        # Append current statistics to cycle to ensure that
        # it will have at least one item
        stats = Stat(self._process)
        stats.set_stats()
        self.curr_cycle[key].append(stats)

        # Release lock
        self.cycle_write_lock.release()

    def _stat_collector(self):
        """
        Statistics collecting thread body
        """
        while True:
            if self._shutdown:
                break

            time_counter = 0
            while time_counter < self.interval:
                time.sleep(self.STAT_INTERVAL_MIN / 1000)
                time_counter += self.STAT_INTERVAL_MIN
                if self._shutdown:
                    break

            # Get system current statistics
            stats = Stat(self._process)
            stats.set_stats()

            # Safely append stat to the current cycle
            self.cycle_write_lock.acquire()
            for k in self.curr_cycle_tracked_keys:
                if k in self.curr_cycle.keys():
                    self.curr_cycle[k].append(stats)
            self.cycle_write_lock.release()
