"""
This system is designed to let users to check if the run had any progress.

While it may seem an easy task, it's very difficult to have a reliable way to
check if everything is fine with the process; The main (rank0) process may be
killed having no chance of notifying about failure. Even if the main process is
alive, the other moving parts may be stuck (network sync with other nodes,
filesystem, dataloader) those are not necessarily part of the main execution
thread. It leaves no other choice other than defining:

> The run is considered to be failed if it
> had not reported any progress in the promised time.

Thus, we can mark progress (we call these `check-in`s) and the expected time of
the next check-in. We can report a check-in after each forwarding each batch and
promising the next check-in to be reported in the next minute. If no check-ins
are received in the next minute, the run is most certainly failed or stuck (or
very unexpected things happened thus compromising the performance of the system).
This can have some exceptions: for instance, checkpointing the model and saving
the state into the filesystem may take a while. For such cases, aim integration
should check-in right before triggering checkpointing by promising much larger
time intervals.

Monitoring of run progress can be easily done by a service that periodically
polls the check-in instances. If the last check-in was there for longer than it
promised, the run is considered to  be failed thus triggering a (configurable)
failure notification.

Check-ins with zero `expect_next_in` values denote an absence of the expiration
date. In order to mark the run as successful, the last check-in should be
reported with a zero `expect_next_in` to indicate no further check-ins are
expected so the monitoring server will not treat stopped process as failed.

# IMPLEMENTATION DETAILS

## FORMAT
The check-ins are implemented to be stored in the filesystem, in `.aim` repo
under the `check_ins` directory. Each file has no contents and encodes all the
information in the name.

The name format is as follows:
    `{run_hash}-{idx:08d}-{flag_name}-{absolute_time:011.2f}-{expect_next_in:05d}`
where `idx` is auto-incremented index per run, `flag_name` is the name of the
flag (usually `check-in`), `absolute_time` is the utc time of the check-in (is
intended only for debugging purposes), `expect_next_in` is the time in seconds
until the next check-in is expected.

## TIME
Note that we don't use last modified time to detect if the file is modified
because it's not that reliable especially for virtual and remote filesystems.
The utc time in the filename may vary across machines, and used only for the
debugging purposes.

## MONITORING SERVICE
The monitoring service supposed to periodically poll the directory and check for
the latest (lexicographically highest) check-ins per run.
If the last check-in was there (starting from the first time the monitoring
server had seen the file) for longer than it promised, the run is considered to
be failed thus triggering a (configurable) failure notification. A grace period is
introduced to avoid false positives.

## NON-BLOCKING INTERFACE

### `RunStatusReporter.report_progress()`:
By default, the check-in is non-blocking call in order to avoid any latency
introduced. This way, the caller can feel free to check-in as soon as possible,
even after each batch is forwarded or report the progress in vert small steps.

In order to avoid overloading the filesystem, not all the check-ins are stored
in the filesystem. Instead, if there is still time before the expiration, we can
wait thus avoiding unnecessary disk I/O. The filesystem writes are done only
when the time is (nearly) up. A separate thread is used to handle this process
which also cleans up of the obsolete check-ins having lower lexicographic order
than the current one.

### `RunStatusReporter.report_successful_finish()`:
Marking the run as successful is blocking call by default to ensure the check-in
is written to the filesystem before the run process exits. Note, that the
initialization of `RunStatusReporter` also does include blocking call to poll the
latest state in case of existing runs.

## INDIRECT INTERFACE
The preferred way of reporting check-ins is to call `.report_progress()` method on the
Run instance. However, in certain cases, the caller may want to check-in from a
code location that has no access to the Run instance (e.g. in dataloader, or in
the checkpoint callback). In such cases, the `.report_progress()` method can be called
indirectly by calling `RunStatusReporter.report_progress()` which will infer the run instance.

This is only possible if there is a single run instance in the process.


# TODO [mahnerak] Add Revision on:
  - [x] Multi-flag support, independent and global flushes
  - [x] Choosing stricter `expect_next_in` values
  - [ ] Legacy support for `progress` check-ins.
"""

import math
import time
import queue
import threading
from abc import abstractmethod
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import ClassVar, Dict, Optional, Tuple, Set, Union

from cachetools import LRUCache

import logging

logger = logging.getLogger(__name__)


cache = LRUCache(maxsize=3)

# expressed in seconds:
IMMEDIATELY = 0
MIN_SUSPEND_TIME = 0.1
PLAN_ADVANCE_TIME = 10
MAX_SUSPEND_TIME = 30
GRACE_PERIOD = 100
INFINITE_TIME = 1_000_000_000


class FileManager(object):
    @abstractmethod
    def poll(self, pattern: str) -> Optional[str]:
        ...

    @abstractmethod
    def touch(self, filename: str, cleanup_file_pattern: Optional[str] = None):
        ...


@dataclass(frozen=True)
class AsteriskType:
    """
    The purpose of this helper symbol is to enable the injecting an asterisk
    into any formatted string no matter what format spec uses.

    For example:
    >>> '{a:.2f}-{b:.2f}'.format(a=3.5, b=Asterisk)
    >>> '3.50-*'
    """

    def __format__(self, __format_spec: str) -> str:
        return "*"


# Singletone instance of AsteriskType
Asterisk = AsteriskType()


@dataclass(order=True, frozen=True)
class CheckIn:
    """
    CheckIn is a dataclass that represents a single check-in.

    All the time-related fields are in `time.monotonic`, relative time expressed in
    seconds, until stated otherwise. In case of `expect_next_in=0` we treat it as
    a special case, meaning that the check-in is not expected to expire.
    Indicies are used to identify check-ins and are unique within a run, auto-incremented.
    """

    idx: int = 0
    expect_next_in: int = field(default=0, compare=False)
    first_seen: float = field(default_factory=time.monotonic, compare=False, repr=False)
    flag_name: str = field(default="check_in", compare=False, repr=True)

    # We keep per-run cache to memoize the first time we've seen check-ins
    per_run_cache: ClassVar[Dict[str, LRUCache]] = defaultdict(
        lambda: LRUCache(maxsize=3)
    )

    def __bool__(self) -> bool:
        return bool(self.idx)

    @classmethod
    def first_seen_cached(
        cls,
        *,
        run_hash: str,
        idx: int,
        expect_next_in: int,
        flag_name: str,
    ) -> float:
        """
        Return the first seen time of the check-in.
        """
        per_run_cache = cls.per_run_cache[run_hash]
        key = (idx, expect_next_in, flag_name)
        try:
            return per_run_cache[key]
        except KeyError:
            now = time.monotonic()
            logger.debug(f"* first time ({now}) seen for {key} for {run_hash}")
            per_run_cache[key] = now
            return now

    @property
    def expiry_date(self) -> float:
        """
        Return the time when the check-in is expected to expire.
        """
        # if the check-in is not expected to expire, we treat it as infinite
        expect_next_in = self.expect_next_in or INFINITE_TIME
        return self.first_seen + expect_next_in

    @classmethod
    def parse(cls, path: Union[Path, str]) -> Tuple[str, "CheckIn"]:
        """
        Parse a check-in file path and return a tuple of:
          * run hash the check-in belongs to,
          * the check-in itself.
        """
        if isinstance(path, str):
            path = Path(path)

        run_hash, str_idx, flag_name, utc_time, str_expect_next_in = path.name.rsplit(
            "-", maxsplit=4
        )

        idx = int(str_idx)
        expect_next_in = int(str_expect_next_in)

        first_seen = cls.first_seen_cached(
            run_hash=run_hash,
            idx=idx,
            expect_next_in=expect_next_in,
            flag_name=flag_name,
        )

        return run_hash, cls(
            idx=idx,
            expect_next_in=expect_next_in,
            first_seen=first_seen,
            flag_name=flag_name,
        )

    @classmethod
    def poll(cls, *, file_mgr, run_hash: str) -> "CheckIn":
        """
        Poll the directory for the current check-in.

        The `current` check-in is defined as the highest one in the lexicographic order.
        """
        pattern = cls.generate_filename(run_hash=run_hash)
        check_in_path = file_mgr.poll(pattern)
        if not check_in_path:
            logger.debug(f"no check-in found for {run_hash}; returning zero-check-in")
            return CheckIn()

        logger.debug(f"found check-in: {check_in_path}")
        parsed_run_hash, check_in = cls.parse(check_in_path)
        assert parsed_run_hash == run_hash
        logger.debug(f"parsed check-in: {check_in}")

        return check_in

    def time_calibrated(self):
        """
        The check-in `expect_next_in` is counted from the time the check-in was
        first created / seen.

        As the `CheckIn` objects are designed to be immutable, we need to
        recalibrate the time when the check-in is expected to expire, returning
        a new `CheckIn` object.
        """
        now = time.monotonic()
        if self.expect_next_in == 0:
            expect_next_in = 0
        else:
            expect_next_in = max(1, math.ceil(self.expiry_date - now))
        new = CheckIn(
            idx=self.idx,
            expect_next_in=expect_next_in,
            first_seen=now,
            flag_name=self.flag_name,
        )
        logger.debug(f"calibrated check-in: {self} -> {new}")
        return new

    @classmethod
    def generate_filename(
        cls,
        *,
        run_hash: Union[str, AsteriskType],
        idx: Union[int, AsteriskType] = Asterisk,
        flag_name: Union[str, AsteriskType] = Asterisk,
        absolute_time: Union[float, AsteriskType] = Asterisk,
        expect_next_in: Union[int, AsteriskType] = Asterisk,
    ) -> str:
        """
        Generate a filename for a check-in.

        Supports Asterisk objects so that we can generate a patterns.

        For example:
        >>> CheckIn.generate_filename(run_hash="run_hash", idx=Asterisk, absolute_time=Asterisk, expect_next_in=10)
        >>> "run_hash-*-check_in-*-10"
        """
        return f"{run_hash}-{idx:016d}-{flag_name}-{absolute_time:011.2f}-{expect_next_in:05d}"

    def touch(
        self,
        *,
        file_mgr,
        run_hash: str,
        cleanup: bool = True,
        calibrate: bool = True,
    ) -> "CheckIn":
        """
        Physically write the check-in to the filesystem so that it is visible to the
        other nodes that share the filesystem.

        As `CheckIn.touch()` could be called much later that it is created, we
        need to calibrate `expected_next_in` w.r.t. current time. If `calibrate` is
        `False` (`True` by default), then `expected_next_in` is not recalibrated.

        If `cleanup` is True (default), this will remove all the expired check-ins.
        """

        if calibrate and self.expect_next_in:
            return self.time_calibrated().touch(
                file_mgr=file_mgr,
                run_hash=run_hash,
                cleanup=cleanup,
                calibrate=False,
            )

        utc_time = time.time()
        filename = self.generate_filename(
            run_hash=run_hash,
            idx=self.idx,
            expect_next_in=self.expect_next_in,
            absolute_time=utc_time,
            flag_name=self.flag_name,
        )

        cleanup_file_pattern = self.generate_filename(
            run_hash=run_hash,
            flag_name=self.flag_name
        ) if cleanup else None

        file_mgr.touch(filename, cleanup_file_pattern)

        return self

    def time_left(self) -> float:
        """
        Returns the time left before the check-in expires.

        If the check-in has no expiry date, then this returns +infinity.
        """
        if self.expect_next_in == 0:
            return math.inf
        now = time.monotonic()
        return self.expiry_date - now


@dataclass(order=True)
class TimedTask:
    """
    A task for the `TimedQueue` that is scheduled to be executed at a given time.
    Only the `time` field is used for comparison. The `overwritten` field is
    to mock deletion of the task from the priority queue.
    """
    when: float = field(compare=True)
    flag_name: str = field(compare=False)
    overwritten: bool = field(default=False, compare=False)


class RunStatusReporter:
    """
    A handler for check-ins for a given run.

    Uses filesystem to store the check-ins. Handles resumed `Run`s.
    Background thread is used to adjust the rate of check-ins written
    to the filesystem in order to avoid overloading.

    Calling `report_successful_finish()` is required to mark the run as
    finished, otherwise the run will be marked as failed.
    """

    instances: Set["RunStatusReporter"] = set()

    def __init__(
        self,
        run_hash: str,
        file_mgr: FileManager,
    ) -> None:
        logger.info(f"creating RunStatusReporter for {run_hash}")
        self.run_hash = run_hash

        self.file_manager = file_mgr
        logger.debug(f"polling for check-ins in {self.file_manager}")

        # Detect if the run was resumed. If so, we need to find the last
        # check-in index and continue counting from there.
        leftover = CheckIn.poll(
            file_mgr=self.file_manager,
            run_hash=self.run_hash,
        )
        if leftover:
            logger.debug(f"leftover check-in: {leftover}")
        else:
            logger.debug("no leftover check-in found. starting from zero")

        self.refresh_condition = threading.Condition()
        self.flush_condition = threading.Condition()
        self.stop_signal = threading.Event()

        # A single lock is used to syncronize all the check-ins API calls.
        # (calls are non-blocking so no need to worry about the performance)
        self.reporter_lock = threading.RLock()
        self.counter = leftover.idx

        # A shared queue for all flags and check-ins is used to avoid having a
        # separate thread for each flag. The queue is sorted by the time when
        # the check-in is expected to be expired.
        #
        # The `last_check_ins` is used to store the last check-in for each flag
        # while `physical_check_ins` is used to store the check-ins that are
        # already written to the filesystem. These are designed to be eventually
        # consistent.
        #
        # The Priority Queue implementation does not allow to update the priority
        # of the existing items, so we need to remove the item and re-insert it
        # with the new priority. This is done by setting `overwritten` flag to
        # `True` and inserting the new item with the same `flag_name`.
        # The `timed_tasks` is used to find the older items to set `overwritten`
        self.queue = queue.PriorityQueue()
        self.last_check_ins: Dict[str, CheckIn] = dict()
        self.physical_check_ins: Dict[str, CheckIn] = dict()
        self.timed_tasks: Dict[str, TimedTask] = dict()

        # We always set the first check-in `starting`.
        logger.info(f"starting from: {self.last_check_ins}")
        self._increment(flag_name="starting")
        # Initialize the background thread and flush all the initial flags
        logger.info(f"starting writer thread for {self}")
        self.thread = threading.Thread(target=self._writer, daemon=True)
        self.thread.start()
        self.flush(block=True)

        # The code below is a workaround to make it accessible from the class
        # interface. This can be especially useful for reporting progress from
        # anywhere in the code.
        self.instances.add(self)
        # We need to patch certain methods to make them
        # available both as instance and class methods.
        self.check_in = self._check_in
        self.report_successful_finish = self._report_successful_finish

    def _touch_flag(
        self,
        flag_name: str,
    ):
        """
        Touches the check-in file on the filesystem. This is blocking call.
        This will also queue the check-in for the next flush if necessary.
        """
        check_in = self.last_check_ins[flag_name]

        if flag_name in self.physical_check_ins and self.physical_check_ins[flag_name].idx == check_in.idx:
            logger.debug(f"Skipping touching `{flag_name}` as it is already up to date")
            self.timed_tasks.pop(flag_name, None)
            logger.debug(f'{flag_name} is not scheduled anymore. It will be invoked as soon as next one appears')
            return

        # Now let's touch the file on the filesystem
        new_check_in = check_in.touch(
            file_mgr=self.file_manager,
            run_hash=self.run_hash,
        )

        self.physical_check_ins[flag_name] = new_check_in

        # We will take the target (recommended) flush time much shorter.
        expiry_date = min(
            new_check_in.expiry_date,
            time.monotonic() + MAX_SUSPEND_TIME
        )
        # Now we reschedule the check-in for the next flush.
        new_timed_task = TimedTask(
            when=expiry_date,
            flag_name=flag_name,
        )
        self._schedule(new_timed_task)
        return new_check_in

    def _schedule(
        self,
        timed_task: TimedTask,
    ):
        """
        Schedules the check-in for the next flush.
        """
        self.timed_tasks[timed_task.flag_name] = timed_task
        self.queue.put(timed_task)
        with self.refresh_condition:
            self.refresh_condition.notify()

    def _increment(
        self,
        *,
        expect_next_in: int = 0,
        flag_name: str,
    ) -> CheckIn:
        """
        Increments the check-in counter and returns the new check-in for the
        provided flag name. The indices are shared across all the flags.
        This is an (almost) non-blocking call.
        """
        idx = self.counter + 1
        self.counter = idx

        logger.debug(f"incrementing {flag_name} idx -> {idx}")

        check_in = CheckIn(
            idx=idx,
            expect_next_in=expect_next_in,
            flag_name=flag_name
        )

        self.last_check_ins[flag_name] = check_in
        # * If there was no such check-in with the same flag name, we will
        #   schedule it to flush immediately.
        # * We want to make sure that more strict `expect_next_in`s are respected
        #   so we need to reschedule the check-in for the next flush.
        #   If we find much sooner expiry date, we will take it immediately.
        # * Notice that `Immediately` does not mean that the call is blocking.
        was_scheduled = self.timed_tasks.get(flag_name)
        if was_scheduled is None:
            # Schedule to flush ASAP
            timed_task = TimedTask(when=0, flag_name=flag_name)
            self._schedule(timed_task)
            logger.debug(f"scheduled {timed_task} ASAP because no physical check-in was found")
        else:
            if was_scheduled.when > check_in.expiry_date:
                # Schedule to flush ASAP
                timed_task = TimedTask(when=0, flag_name=flag_name)
                self._schedule(timed_task)
                # We need to remove the old task from the queue but the queue
                # implementation does not allow to update the priority of the
                # existing items, so we need to remove the item and re-insert it
                # with the new priority. This is done by setting `overwritten`
                # flag to `True` and inserting the new item with the same
                # `flag_name`. The writer thread will just ignore such items.
                was_scheduled.overwritten = True
                logger.debug(f"scheduled {timed_task} because it newer is stricter than {was_scheduled}")

        return check_in

    @classmethod
    def default(cls) -> "RunStatusReporter":
        """
        Returns the default instance of the RunStatusReporter to make it possible
        to access the instance methods from the class interface. This is useful
        for reporting progress from anywhere in the code.
        """
        try:
            default_instance, = cls.instances
        except ValueError:
            if cls.instances:
                raise ValueError(
                    f"{cls.__name__} has {len(cls.instances)} instances, indirect check-in is not supported"
                )
            else:
                logger.warning(f"{cls.__name__} has no instances")
                return None
        return default_instance

    def close(self):
        """
        Stops the background thread, flushes all the pending check-ins and
        cleans up the resources.
        """
        try:
            # Handle cases when close is called manually.
            # Subsequent call of close() (i.e. on resource clean-up) should not fail.
            self.instances.remove(self)
            self.stop()
        except KeyError:
            pass

    def stop(self):
        """
        Disables any new check-ins to be scheduled, flushes all the pending
        check-ins and stops the background thread.
        """
        with self.reporter_lock:
            self.stop_signal.set()
            self.flush(block=True)
            self.thread.join()

    def _writer(self):
        """
        The writer thread that periodically flushes the last check-in.
        This background thread also takes care of cleaning up expired check-ins
        and throttling the check-in rate in order to avoid overloading the
        filesystem. However, it can be notified to flush the last check-in
        on-demand. This is useful when reporting certain events that are preferable
        to be reported as soon as possible, e.g. success status of the Run.
        """

        remaining = 0
        while True:
            # First we need to decide how much time we need to wait to reach the
            # next appropriate flush time. It is either the remaining time from
            # the previous flush, or the moment new check-in is registered.
            with self.refresh_condition:
                logger.debug(f"no interesting things to do, sleeping for {remaining}")
                logger.debug("until woken up")
                logger.debug(f'unfinished tasks: {self.queue.unfinished_tasks}')
                self.refresh_condition.wait(timeout=remaining)

            timed_task: Optional[TimedTask]
            try:
                timed_task = self.queue.get(timeout=0)
            except queue.Empty:
                timed_task = None
            else:
                assert isinstance(timed_task, TimedTask)

                if timed_task.overwritten:
                    logger.debug('detected overwritten task... done')
                    self.queue.task_done()
                    continue

                remaining = timed_task.when - time.monotonic() - PLAN_ADVANCE_TIME
                # remaining = max(remaining, MIN_SUSPEND_TIME)
                remaining = min(remaining, MAX_SUSPEND_TIME)
                logger.debug(f'time remaining: {remaining}')

                if remaining > 0:
                    # TODO Should we push a little late?
                    self._schedule(timed_task)
                    logger.debug(f'too soon, {remaining} remaining')
                    logger.debug(f'putting back for the future: {timed_task}')
                    logger.debug(f'now: {time.monotonic()}... scheduled for: {timed_task.when}')
                    self.queue.task_done()
                    # Mark the task to signal about the clean state.
                    timed_task = None

            # If during the last iteration we could not find a new check-in
            # to flush, we define it as clean state. In the case of if the stop
            # signal is set, we can safely exit the thread as there will be no
            # more check-ins to process in the future.
            if timed_task is None:
                remaining = MAX_SUSPEND_TIME
                with self.flush_condition:
                    self.flush_condition.notify()
                if self.stop_signal.is_set():
                    return
            else:
                logger.debug(f'only {remaining} remaining... flushing one task')
                self._touch_flag(timed_task.flag_name)
                self.queue.task_done()
                # Let's immediately proceed to the next iteration to check if
                # there are any new check-ins to flush.
                remaining = IMMEDIATELY

    def flush(
        self,
        flag_name: Optional[str] = None,
        block: bool = True,
    ) -> None:
        """
        Flush the last check-in.
        If `flag_name` is specified, only the check-ins for the given flag
        will be flushed.
        Otherwise, all the check-ins will be flushed. In this case, the order
        of (active) check-ins (per flag name) will be preserved.
        """
        logger.debug(f"notifying {self}")

        with self.reporter_lock:
            flag_names = [flag_name] if flag_name is not None else self.timed_tasks
            with self.flush_condition:
                for flag_name in flag_names:
                    logger.debug(f"flushing {flag_name}")
                    # We add a new task with the highest priority to flush the
                    # last check-in. This task will be processed by the writer
                    # thread immediately.
                    self._schedule(TimedTask(when=0, flag_name=flag_name))

                # As there may be no flag names at all, the queue may be
                # untouched. In this case, we need to notify the writer thread
                # explicitly.
                with self.refresh_condition:
                    self.refresh_condition.notify()

                # If `block` is set, we wait until the writer thread finishes
                # flushing the last check-in.
                if block:
                    logger.debug("blocking until the writer finishes...")
                    self.flush_condition.wait()
                    logger.debug("done")

    def _check_in(
        self,
        *,
        expect_next_in: int = 0,
        flag_name: str = "check_in",
        flush: bool = False,
        block: bool = False,
    ) -> None:
        """
        Check-in and optionally mark an expiry date by setting `expect_next_in`.

        If `block` is True, then this will block until the check-in is flushed.
        """
        if block:
            flush = True

        if self.stop_signal.is_set():
            raise RuntimeError("check-in is not allowed after stopping the writer thread")

        with self.reporter_lock:
            self._increment(
                expect_next_in=expect_next_in,
                flag_name=flag_name,
            )
            if flush:
                self.flush(block=block)

    def _report_successful_finish(
        self,
        *,
        flush: bool = True,
        block: bool = True,
    ) -> None:
        """
        Report a successful end of the Run.

        By default this will block until the check-in is flushed.
        """
        return self._check_in(flush=flush, block=block, flag_name="finished")

    # The instance method `report_progress` and `report_successful_finish` is patched into
    # the instance in `__post_init__`
    # so the same name is used for both the instance method and the class method.
    @classmethod
    def report_progress(
        cls,
        *,
        expect_next_in: int = 0,
        flush: bool = False,
        block: bool = False,
    ) -> None:
        """
        Check-in and optionally mark an expiry date by setting `expect_next_in`.

        If `block` is True, then this will block until the check-in is flushed.

        Note: This is a classmethod and designed to be called like:
        `RunStatusReporter.report_progress(expect_next_in=10)`
        * If no instance is available, this will log a warning and return.
        * If multiple instances are available, this will raise an error.
        """
        default_instance = cls.default()
        if default_instance is None:
            return
        default_instance._check_in(expect_next_in=expect_next_in, flush=flush, block=block)

    @classmethod
    def report_successful_finish(
        cls,
        *,
        flush: bool = True,
        block: bool = True,
    ) -> None:
        """
        Report a successful end of the Run.

        By default this will block until the check-in is flushed.

        Note: This is a classmethod and designed to be called like:
        `RunStatusReporter.report_successful_finish()`
        * If no instance is available, this will log a warning and return.
        * If multiple instances are available, this will raise an error.
        """
        default_instance = cls.default()
        if default_instance is None:
            return
        default_instance._report_successful_finish(flush=flush, block=block)


REPORT_INTERVAL = 5  # 5 seconds


class ScheduledStatusReporter(object):
    def __init__(self,
                 status_reporter: RunStatusReporter,
                 flag: str = 'progress',
                 touch_path: Optional[Path] = None,
                 interval: int = REPORT_INTERVAL
                 ):
        self.status_reporter = status_reporter
        self.flag = flag
        self.touch_path = touch_path
        self.report_interval = interval
        self.throttle = 30
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.stop_signal = threading.Event()
        self.thread.start()

    def _run(self):
        self.status_reporter.check_in(expect_next_in=self.throttle, flag_name=self.flag, block=True)

        while True:
            if self.stop_signal.wait(timeout=self.report_interval):
                # report last heartbeat
                self.status_reporter.check_in(expect_next_in=1, flag_name=self.flag, block=True)
                if self.touch_path is not None:
                    self.touch_path.touch(exist_ok=True)
                break
            else:
                self.status_reporter.check_in(expect_next_in=self.throttle, flag_name=self.flag)
                if self.touch_path is not None:
                    self.touch_path.touch(exist_ok=True)

    def stop(self):
        self.stop_signal.set()
        self.thread.join()
