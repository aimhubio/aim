import io
import logging
import re
import sys
import time

from psutil import Process, cpu_percent
from threading import Thread
from typing import Union
from weakref import WeakValueDictionary

from aim._ext.system_info.configs import AIM_RESOURCE_METRIC_PREFIX
from aim._ext.system_info.stat import Stat
from aimcore.callbacks import Caller, event

logger = logging.getLogger(__name__)


class ResourceTracker(Caller):
    _buffer_registry = WeakValueDictionary()
    _old_out_write = None
    _old_err_write = None

    @event
    def logs_collected(self, log_lines, **kwargs):
        """Is called periodically when the new output stream buffer is available."""

    @event
    def system_resource_stats_collected(self, stats, context, **kwargs):
        """Is called periodically when the resource usage stats are available."""

    @classmethod
    def _install_stream_patches(cls):
        cls._old_out_write = sys.stdout.write
        cls._old_err_write = sys.stderr.write

        def new_out_write(data):
            cls._old_out_write(data)
            if isinstance(data, str):
                data = data.encode()
            for buffer in cls._buffer_registry.values():
                buffer.write(data)

        def new_err_write(data):
            cls._old_err_write(data)
            if isinstance(data, str):
                data = data.encode()
            for buffer in cls._buffer_registry.values():
                buffer.write(data)

        sys.stdout.write = new_out_write
        sys.stderr.write = new_err_write

    @classmethod
    def _uninstall_stream_patches(cls):
        sys.stdout.write = cls._old_out_write
        sys.stderr.write = cls._old_err_write

    STAT_INTERVAL_MIN = 0.1
    STAT_INTERVAL_MAX = 24 * 60 * 60.0
    STAT_INTERVAL_DEFAULT = 60.0

    @classmethod
    def check_interval(cls, interval, warn=True):
        if interval is None:
            warn = False
        if not isinstance(interval, (int, float)) or not cls.STAT_INTERVAL_MIN <= interval <= cls.STAT_INTERVAL_MAX:
            if warn:
                logger.warning('To track system resource usage '
                               'please set `system_tracking_interval` '
                               'greater than 0 and less than 1 day')
            return False
        return True

    reset_cpu_cycle = False

    @staticmethod
    def reset_proc_interval():
        """
        Calls process `cpu_percent` which resets cpu utilization tracking cycle
        Read more: https://psutil.readthedocs.io/en/latest/#psutil.cpu_percent
        """
        cpu_percent(0.0)

    def __init__(self,
                 interval: Union[int, float] = STAT_INTERVAL_DEFAULT,
                 capture_logs: bool = True):
        super().__init__()
        self._stat_capture_interval = None
        if self.check_interval(interval, warn=False):
            self._stat_capture_interval = interval

        # terminal log capturing
        self._capture_logs = capture_logs
        self._log_capture_interval = 1
        self._old_out = None
        self._old_err = None
        self._io_buffer = io.BytesIO()
        self._line_counter = 0

        try:
            self._process = Process()
        except Exception:
            self._process = None

        # Start thread to collect stats and logs at intervals
        self._th_collector = Thread(target=self._stat_collector, daemon=True)
        self._shutdown = False
        self._started = False

        if ResourceTracker.reset_cpu_cycle is False:
            ResourceTracker.reset_cpu_cycle = True
            self.reset_proc_interval()

    def start(self):
        """
        Start statistics collection
        """
        if self._started:
            return

        self._started = True
        if self._capture_logs:
            # install the stream patches if not done yet
            if not self._buffer_registry:
                self._install_stream_patches()
            self._buffer_registry[id(self)] = self._io_buffer
        # Start thread to asynchronously collect statistics
        self._th_collector.start()

    def stop(self):
        if not self._started:
            return

        self._shutdown = True
        self._th_collector.join()
        if self._capture_logs:
            # read and store remaining buffered logs
            self._store_buffered_logs()
            # unregister the buffer
            del self._buffer_registry[id(self)]
            # uninstall stream patching if no buffer is left in the registry
            if not self._buffer_registry:
                self._uninstall_stream_patches()

    def close(self):
        """Interface to make compatible with Resource AutoClean"""
        self.stop()

    def _track(self, stat: Stat):
        # Store system stats
        stats = {}
        for resource, usage in stat.system.items():
            stats['{}{}'.format(AIM_RESOURCE_METRIC_PREFIX, resource)] = usage
        self.system_resource_stats_collected(stats=stats, context={})
        # Store GPU stats
        for gpu_idx, gpu in enumerate(stat.gpus):
            stats = {}
            for resource, usage in gpu.items():
                stats['{}{}'.format(AIM_RESOURCE_METRIC_PREFIX, resource)] = usage
            self.system_resource_stats_collected(stats=stats, context={'gpu': gpu_idx})

    def _stat_collector(self):
        """
            Statistics collecting thread body
        """
        stat_time_counter = 0
        log_capture_time_counter = 0

        # store initial system usage stats
        if self._stat_capture_interval:
            stat = Stat(self._process)
            self._track(stat)

        while True:
            # Get system statistics
            if self._shutdown:
                break

            time.sleep(0.1)
            stat_time_counter += 0.1
            log_capture_time_counter += 0.1

            if self._stat_capture_interval and stat_time_counter > self._stat_capture_interval:
                stat = Stat(self._process)
                self._track(stat)
                stat_time_counter = 0

            if self._capture_logs and log_capture_time_counter > self._log_capture_interval:
                self._store_buffered_logs()
                log_capture_time_counter = 0

    def _store_buffered_logs(self):
        _buffer_size = self._io_buffer.tell()
        if not _buffer_size:
            return

        self._io_buffer.seek(0)
        # read and reset the buffer
        data = self._io_buffer.read(_buffer_size)
        self._io_buffer.seek(0)
        # handle the buffered data and store

        lines = data.split(b'\n')
        ansi_csi_re = re.compile(b"\001?\033\\[((?:\\d|;)*)([a-dA-D])\002?")

        def _handle_csi(line):
            def _remove_csi(line):
                return re.sub(ansi_csi_re, b'', line)

            for match in ansi_csi_re.finditer(line):
                arg, command = match.groups()
                arg = int(arg.decode()) if arg else 1
                if command == b'A':  # cursor up
                    self._line_counter -= arg
                if command == b'B':  # cursor down
                    self._line_counter += arg

            return _remove_csi(line)

        line = None
        log_lines = []
        for line in lines:
            # handle cursor up and down symbols
            line = _handle_csi(line)
            # handle each line for carriage returns
            line = line.rsplit(b'\r')[-1]
            log_lines.append((line.decode(), self._line_counter))
            self._line_counter += 1
        self.logs_collected(log_lines=log_lines)
        self._line_counter -= 1

        # if there was no b'\n' at the end of the data keep the last line in buffer for further writing
        if line != b'':
            self._io_buffer.write(line)
