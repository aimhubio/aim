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
"""

import math
import threading
import time
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import ClassVar, Dict, Tuple, Set, Union, TYPE_CHECKING

from cachetools import LRUCache

if TYPE_CHECKING:
    from aim.sdk import Run

import logging

logger = logging.getLogger(__name__)


cache = LRUCache(maxsize=3)


GRACE_PERIOD = 100  # seconds
MAX_SUSPEND_TIME = 30  # 5 seconds
PLAN_ADVANCE_TIME = 10  # 5 seconds


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
            logger.info(f"* first time ({now}) seen for {key} for {run_hash}")
            per_run_cache[key] = now
            return now

    @property
    def expiry_date(self) -> float:
        """
        Return the time when the check-in is expected to expire.
        """
        return self.first_seen + self.expect_next_in

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
    def poll(cls, *, directory: Path, run_hash: str) -> "CheckIn":
        """
        Poll the directory for the current check-in.

        The `current` check-in is defined as the highest one in the lexicographic order.
        """
        pattern = cls.generate_filename(run_hash=run_hash)
        paths = list(directory.glob(pattern))

        if not paths:
            logger.info(f"no check-in found for {run_hash}; returning zero-check-in")
            return CheckIn()

        check_in_path = max(paths)
        logger.info(f"found check-in: {check_in_path}")
        parsed_run_hash, check_in = cls.parse(check_in_path)
        assert parsed_run_hash == run_hash
        logger.info(f"parsed check-in: {check_in}")

        return check_in

    def increment(
        self,
        *,
        expect_next_in: int = 0,
        flag_name: str = "check-in",
    ) -> "CheckIn":
        """
        Create a new check-in and auto-increment the index based on the current one.
        """
        new = CheckIn(
            idx=self.idx + 1,
            expect_next_in=max(expect_next_in, self.expect_next_in),
            flag_name=flag_name,
        )
        logger.info(f"incrementing check-in: {self} -> {new}")
        return new

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
        logger.info(f"calibrated check-in: {self} -> {new}")
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

    def cleanup(
        self,
        *,
        directory: Path,
        run_hash: str,
    ) -> "CheckIn":
        """
        Cleanups all the expired check-ins for the given run hash.

        This will remove all check-ins that are older than the current one
        matching the same flag_name.
        Returns the new current check-in.
        """
        pattern = self.generate_filename(run_hash=run_hash, flag_name=self.flag_name)
        *paths_to_remove, current_check_in_path = sorted(directory.glob(pattern))
        logger.info(f"found {len(paths_to_remove)} check-ins:")
        logger.info(f"the acting one: {current_check_in_path}")
        for path in paths_to_remove:
            logger.info(f"check-in {path} is being removed")
            try:
                # Ignore errors, as the file may have been removed already.
                path.unlink()
            except OSError:
                pass
            logger.info(f"check-in {path} removed")

        parsed_run_hash, check_in = self.parse(current_check_in_path)
        assert parsed_run_hash == run_hash
        logger.info(f"returning acting check-in after cleanup: {check_in}")

        return check_in

    def touch(
        self,
        *,
        directory: Union[Path, str],
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
        if not isinstance(directory, Path):
            directory = Path(directory)

        if calibrate and self.expect_next_in:
            return self.time_calibrated().touch(
                directory=directory,
                run_hash=run_hash,
                cleanup=cleanup,
                calibrate=False,
            )

        directory.mkdir(parents=True, exist_ok=True)

        utc_time = time.time()
        filename = self.generate_filename(
            run_hash=run_hash,
            idx=self.idx,
            expect_next_in=self.expect_next_in,
            absolute_time=utc_time,
            flag_name=self.flag_name,
        )
        new_path = directory / filename
        logger.info(f"touching check-in: {new_path}")

        new_path.touch(exist_ok=True)

        if cleanup:
            self.cleanup(directory=directory, run_hash=run_hash)

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
        run: 'Run',
    ) -> None:
        logger.info(f"creating RunStatusReporter for {run}")
        self.run_hash = run.hash
        self.repo_dir = Path(run.repo.path)
        self.dir = self.repo_dir / "check_ins"
        logger.info(f"polling for check-ins in {self.dir}")
        leftover = CheckIn.poll(
            directory=self.dir,
            run_hash=self.run_hash,
        )
        if leftover:
            logger.info(f"leftover check-in: {leftover}")
        else:
            logger.info("no leftover check-in found. starting from zero")
        self.last_check_in = leftover.increment(flag_name="starting")
        self.physical_check_in = self.last_check_in.touch(
            directory=self.dir,
            run_hash=self.run_hash,
        )
        logger.info(f"starting from: {self.physical_check_in}")

        self.instances.add(self)

        self.thread = threading.Thread(target=self.writer, daemon=True)
        self.flush_condition = threading.Condition()
        self.stop_signal = threading.Event()
        logger.info(f"starting writer thread for {self}")
        self.thread.start()

        # we need to patch certain methods to make them
        # available both as instance and class methods.
        self.check_in = self._check_in
        self.report_successful_finish = self._report_successful_finish

    @classmethod
    def default(cls) -> "RunStatusReporter":
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
        self.instances.remove(self)
        self.stop()

    def stop(self):
        """
        Flush the last check-in and stop the thread.
        """
        self.stop_signal.set()
        self.flush(block=False)
        self.thread.join()

    def writer(self):
        """
        The writer thread that periodically flushes the last check-in.
        This background thread also takes care of cleaning up expired check-ins
        and throttling the check-in rate in order to avoid overloading the
        filesystem. However, it can be notified to flush the last check-in
        on-demand. This is useful when reporting certain events that are preferable
        to be reported as soon as possible, e.g. success status of the Run.
        """
        while True:
            time_left = self.physical_check_in.time_left()
            if time_left + GRACE_PERIOD < 0:
                logger.info(f"Missing check-in. Grace period expired { - GRACE_PERIOD - time_left:.2f} seconds ago. "
                            f"Notifications should be sent soon by the monitoring server.")
            elif time_left < 0:
                logger.info(f"Missing check-in. Late: {-time_left:.2f} seconds. "
                            f"Remaining grace period: {GRACE_PERIOD + time_left:.2f} seconds")
            elif time_left < PLAN_ADVANCE_TIME:
                logger.info(f"Missing check-in. Time left: {time_left}:.2f")
            plan = max(time_left - PLAN_ADVANCE_TIME, 1.0)
            suspend_time = min(plan, MAX_SUSPEND_TIME)

            with self.flush_condition:
                self.flush_condition.wait(timeout=suspend_time)

            # If the stop signal is set, then no new check-ins will be written,
            # So we can safely exit the thread after finishing what we have now.
            is_last_check = self.stop_signal.is_set()

            check_in = self.last_check_in
            if check_in != self.physical_check_in:
                logger.info(f"detected newest check-in: {check_in}")
                self.physical_check_in = check_in.touch(
                    directory=self.dir, run_hash=self.run_hash
                )
                logger.info(f"changing to -> {self.physical_check_in}")

            if is_last_check:
                logger.info("writer thread stopping as requested")
                return

    def flush(
        self,
        block: bool = True,
    ) -> None:
        """
        Flush the last check-in.
        """
        logger.info(f"notifying {self}")
        with self.flush_condition:
            self.flush_condition.notify_all()
        if block:
            logger.info("blocking until the writer finishes")
            while not self.last_check_in == self.physical_check_in:
                time.sleep(0.2)  # TODO use notify
                pass

    def _check_in(
        self,
        *,
        expect_next_in: int = 0,
        flag_name: str = "check_in",
        block: bool = False,
    ) -> None:
        """
        Check-in and optionally mark an expiry date by setting `expect_next_in`.

        If `block` is True, then this will block until the check-in is flushed.
        """
        if self.stop_signal.is_set():
            raise RuntimeError("check-in is not allowed after stopping the writer thread")

        self.last_check_in = self.last_check_in.increment(
            expect_next_in=expect_next_in,
            flag_name=flag_name,
        )
        if block:
            self.flush(block=True)

    def _report_successful_finish(
        self,
        *,
        block: bool = True,
    ) -> None:
        """
        Report a successful end of the Run.

        By default this will block until the check-in is flushed.
        """
        return self._check_in(block=block, flag_name="finished")

    # The instance method `report_progress` and `report_successful_finish` is patched into
    # the instance in `__post_init__`
    # so the same name is used for both the instance method and the class method.
    @classmethod
    def report_progress(
        cls,
        *,
        expect_next_in: int = 0,
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
        default_instance._check_in(expect_next_in=expect_next_in, block=block)

    @classmethod
    def report_successful_finish(
        cls,
        *,
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
        default_instance._report_successful_finish(block=block)
