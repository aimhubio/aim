from psutil import Process, cpu_percent
from threading import Thread
import time
import weakref
import sys
import io
import re
from typing import Union

from aim.ext.resource.stat import Stat
from aim.ext.resource.configs import AIM_RESOURCE_METRIC_PREFIX
from aim.ext.resource.log import LogLine


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

    def __init__(self, track, interval: Union[int, float] = STAT_INTERVAL_DEFAULT, capture_logs: bool = True):
        self._track_func = weakref.WeakMethod(track)
        self.interval = interval

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
        if self._capture_logs:
            self._install_stream_patches()
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
            self._uninstall_stream_patches()

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
        stat_time_counter = 0
        log_capture_time_counter = 0

        while True:
            # Get system statistics
            if self._shutdown:
                break

            time.sleep(0.1)
            stat_time_counter += 0.1
            log_capture_time_counter += 0.1

            if stat_time_counter > self.interval:
                stat = Stat(self._process)
                self._track(stat)
                stat_time_counter = 0

            if log_capture_time_counter > self._log_capture_interval:
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
        if len(lines) == 1:  # we're still on the same line
            self._line_counter -= 1

        ansi_csi_re = re.compile(b"\001?\033\\[((?:\\d|;)*)([a-zA-Z])\002?")

        def _handle_csi(l):
            for match in ansi_csi_re.finditer(l):
                arg, command = match.groups()
                arg = int(arg.decode()) if arg else 1
                if command == b'A':  # cursor up
                    self._line_counter -= arg
                if command == b'B':  # cursor down
                    self._line_counter += arg

        for line in lines:
            # handle each line for carriage returns
            log_line = LogLine(line.rsplit(b'\r')[-1].decode())
            _handle_csi(line)
            self._track_func()(log_line, name='logs', step=self._line_counter)
            self._line_counter += 1

    def _install_stream_patches(self):
        self._old_out_write = sys.stdout.write
        self._old_err_write = sys.stderr.write

        def new_out_write(data):
            self._old_out_write(data)
            if isinstance(data, str):
                data = data.encode()
            self._io_buffer.write(data)

        def new_err_write(data):
            self._old_err_write(data)
            if isinstance(data, str):
                data = data.encode()
            self._io_buffer.write(data)

        sys.stdout.write = new_out_write
        sys.stderr.write = new_err_write

    def _uninstall_stream_patches(self):
        sys.stdout.write = self._old_out_write
        sys.stderr.write = self._old_err_write

