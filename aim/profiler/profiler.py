import os
import time
import psutil
import threading
from collections import OrderedDict

from aim.profiler.stat import Stat
from aim.sdk.track import track
from aim.engine.types import Singleton
from aim.engine.configs import AIM_PROFILER_ENABLED


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

        # Dict consisting of `key: [<stat_items_arr>]` pairs,
        # where key is the current cycle tracked key and
        # value is an array of arrays of tracked statistics
        self.curr_cycle = OrderedDict()
        # OrderedDict consisting of `key: [<count>, <tracked_key_pos>]`,
        # where `count` is the number of duplications of the same `key` and
        # `tracked_key_pos` is an array of tracked positions at the moment.
        # Such situation can occur if `key` is passed inside a loop
        # (e.g. tf.while_loop or tf.repeat).
        self.curr_cycle_keys = OrderedDict()
        # This lock must be acquired when accessing shared objects of
        # the current cycle to avoid race conditions
        self.cycle_write_lock = threading.Lock()
        # Auto detection mode of cycles
        self.auto_detect_cycle = False
        # Aggregate duplicate labels
        self.agg_duplicates = False

        # Set current running process
        try:
            self._process = psutil.Process()
            Stat.set_process(self._process)
        except Exception:
            self._process = None

        # Start thread to collect stats at interval
        self._thread = threading.Thread(target=self._stat_collector,
                                        daemon=True)
        self._shutdown = False
        self._started = False

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

    def start(self, auto_detect_cycles=True, agg_duplicates=False):
        """
        Start profiler: enable profiler and run statistics collection thread
        """
        if not self._started:
            self._started = True

            self.auto_detect_cycle = auto_detect_cycles
            self.agg_duplicates = agg_duplicates

            # Set environment variable indicating that profiler is enabled
            os.environ[AIM_PROFILER_ENABLED] = 'true'

            # Start thread to asynchronously collect statistics
            self._thread.start()

    def label_tracking_start(self, key):
        """
        Signal collector-thread to start storing statistics under `key`(or
        `key-index` in case of loops exist in the current cycle)
        """
        # Acquire lock on cycle objects to make other threads wait
        # until lock is released
        self.cycle_write_lock.acquire()

        # Check if auto detection mode is enabled and store cycle if
        # conditions are met
        if self.auto_detect_cycle and key in self.curr_cycle_keys:
            if key == list(self.curr_cycle_keys.keys())[0]:
                self.store_cycle()
            else:
                print('Error. Auto detection of cycles is enabled and ' +
                      'duplicated keys are found')
                self.cycle_write_lock.release()
                return

        # Reset process interval
        Stat.reset_proc_interval()

        # Add `key` to curr_cycle_keys
        if key not in self.curr_cycle_keys:
            self.curr_cycle_keys.setdefault(key, [0, [0]])
        else:
            self.curr_cycle_keys[key][0] += 1
            self.curr_cycle_keys[key][1].append(self.curr_cycle_keys[key][0])

        if self.agg_duplicates:
            key_index = self._get_key_index(key)
            key_name = key
        else:
            key_index = 0
            key_name = self._get_key_name(key)

        # Add `key` to current cycle and to array of tracked keys
        self.curr_cycle.setdefault(key_name, {})
        self.curr_cycle[key_name].setdefault(key_index, [])

        # Allow other threads to access shared objects
        self.cycle_write_lock.release()

    def label_tracking_stop(self, key):
        """
        Remove `key` from array of tracked keys to stop collecting statistics
        """
        # Get current statistics before acquiring lock
        stats = Stat(self._process)
        stats.set_stats()

        self.cycle_write_lock.acquire()

        if key not in self.curr_cycle or \
                key not in self.curr_cycle_keys or \
                len(self.curr_cycle_keys[key][1]) == 0:
            self.cycle_write_lock.release()
            return

        if self.agg_duplicates:
            key_index = self._get_key_index(key)
            key_name = key
        else:
            key_index = 0
            key_name = self._get_key_name(key)

        # Remove the latest position of tracked `key`
        self.curr_cycle_keys[key][1].pop()

        # Append current statistics to cycle to ensure that
        # it will have at least one item
        self.curr_cycle[key_name][key_index].append(stats)

        self.cycle_write_lock.release()

    def store_cycle(self):
        """
        Aggregate, serialize and store cycle
        """
        # Check if cycle is done and append it to the cycles storage
        if len(self.curr_cycle.keys()) == 0:
            return

        agg_cycle = {}
        for k, cycle_stats in self.curr_cycle.items():
            indexed_agg = {}
            for k_index, indexed_stats in cycle_stats.items():
                indexed_agg[k_index] = Stat.aggregate_items(indexed_stats,
                                                            Stat.AGG_MODE_AVG,
                                                            False)

            if self.agg_duplicates:
                agg_cycle[k] = Stat.aggregate_items(indexed_agg.values(),
                                                    self.agg_duplicates,
                                                    self.agg_duplicates)
            else:
                agg_cycle[k] = indexed_agg[0]

        self.cycles.append(agg_cycle)
        self.cycle_index += 1
        self.curr_cycle_keys = OrderedDict()
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

    def cycle_end(self):
        """
        End one full cycle(is used when auto dection mode is disabled)
        """
        self.cycle_write_lock.acquire()
        self.store_cycle()
        self.cycle_write_lock.release()

    def _get_key_name(self, key, index=None):
        """
        Return full name of the `key`. Name can be auto-indexed if
        duplication of the same key is found.
        """
        if key not in self.curr_cycle_keys:
            raise KeyError('key \'{}\' not found'.format(key))

        if not index:
            if self.curr_cycle_keys[key][0] == 0 or \
                    len(self.curr_cycle_keys[key][1]) == 0:
                return key
            else:
                index = self.curr_cycle_keys[key][1][-1]

        return '{}-{}'.format(key, index) if index > 0 else key

    def _get_key_index(self, key):
        """
        Returns position of the key in current cycle. Index is always 0 if
        there are no duplications of the same key in the cycle.
        """
        if key not in self.curr_cycle_keys:
            raise KeyError('key \'{}\' not found'.format(key))

        if self.curr_cycle_keys[key][0] == 0 or \
                len(self.curr_cycle_keys[key][1]) == 0:
            return 0
        else:
            return self.curr_cycle_keys[key][1][-1]

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
            for k, index_info in self.curr_cycle_keys.items():
                for i in index_info[1]:
                    if self.agg_duplicates:
                        key_index = i
                        key_name = k
                    else:
                        key_index = 0
                        key_name = self._get_key_name(k, i)

                    if key_name in self.curr_cycle and \
                            key_index in self.curr_cycle[key_name]:
                        self.curr_cycle[key_name][key_index].append(stats)
            self.cycle_write_lock.release()
