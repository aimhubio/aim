import time
import psutil
import threading

from aim.sdk.track import track
from aim.engine.types import Singleton
from aim.profiler.stat import Stat


class Profiler(metaclass=Singleton):
    STAT_INTERVAL_MIN = 5
    STAT_INTERVAL_MAX = 500
    STAT_INTERVAL_DEFAULT = 10
    STAT_SEC_INTERVAL_DEFAULT = 2
    SQUASH_AMOUNT = 10

    def __init__(self):
        self._interval = self.STAT_INTERVAL_DEFAULT
        self._sec_interval = self.STAT_SEC_INTERVAL_DEFAULT
        self._squash = self.SQUASH_AMOUNT

        self.last_squash_timestamp = 0
        self.cycle_index = 0
        self.cycles = []

        self.curr_cycle_keys = []
        self.curr_cycle_tracked_keys = []
        self.curr_cycle = {}
        self.cycle_write_lock = False

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
    def squash(self, squash: int):
        if squash >= 1:
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
        # Check if cycle is done and append it to the cycles storage
        if key in self.curr_cycle_keys and key == self.curr_cycle_keys[0]:
            self.cycle_write_lock = True

            agg_cycle = {}
            for k, cycle_stats in self.curr_cycle.items():
                agg_cycle[k] = Stat.aggregate_items(cycle_stats,
                                                    Stat.AGG_MODE_AVG,
                                                    False)

            self.cycles.append(agg_cycle)
            self.cycle_index += 1
            self.curr_cycle_keys = []
            self.curr_cycle = {}

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

                for k in squashed_cycles.keys():
                    aggregate_cycle = Stat.aggregate_items(squashed_cycles[k],
                                                           Stat.AGG_MODE_AVG,
                                                           True).to_dict()
                    squashed_cycles[k] = aggregate_cycle

                track('Stats', 'system', squashed_cycles)

                self.cycle_index = 0
                self.cycles = []

            self.cycle_write_lock = False

        Stat.reset_proc_interval()
        self.curr_cycle[key] = []
        self.curr_cycle_tracked_keys.append(key)
        self.curr_cycle_keys.append(key)

    def cycle(self, key):
        self.curr_cycle_tracked_keys.remove(key)

    def _stat_collector(self):
        while True:
            if self._shutdown:
                break

            time_counter = 0
            while time_counter < self.interval:
                time.sleep(self.STAT_INTERVAL_MIN / 1000)
                time_counter += self.STAT_INTERVAL_MIN
                if self._shutdown:
                    break

            if self.cycle_write_lock:
                continue

            stat_time = round(time.time() * self.interval)
            stat_time /= self.interval

            stats = Stat(self._process)
            stats.set_stats()
            for k in self.curr_cycle_tracked_keys:
                self.curr_cycle[k].append(stats)
