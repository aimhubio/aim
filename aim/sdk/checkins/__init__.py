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
    ) -> float:
        """
        Return the first seen time of the check-in.
        """
        per_run_cache = cls.per_run_cache[run_hash]
        key = (idx, expect_next_in)
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

        run_hash, str_idx, sep, utc_time, str_expect_next_in = path.name.rsplit(
            "-", maxsplit=4
        )
        assert sep == "check_in"

        idx = int(str_idx)
        expect_next_in = int(str_expect_next_in)

        first_seen = cls.first_seen_cached(
            run_hash=run_hash, idx=idx, expect_next_in=expect_next_in
        )

        return run_hash, cls(
            idx=idx,
            expect_next_in=expect_next_in,
            first_seen=first_seen,
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

    def increment(self, *, expect_next_in: int = 0) -> "CheckIn":
        """
        Create a new check-in and auto-increment the index based on the current one.
        """
        new = CheckIn(
            idx=self.idx + 1,
            expect_next_in=max(expect_next_in, self.expect_next_in),
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
        )
        logger.info(f"calibrated check-in: {self} -> {new}")
        return new

    @classmethod
    def generate_filename(
        cls,
        *,
        run_hash: Union[str, AsteriskType],
        idx: Union[int, AsteriskType] = Asterisk,
        flag_name: Union[str, AsteriskType] = "check_in",
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
        return f"{run_hash}-{idx:08d}-{flag_name}-{absolute_time:011.2f}-{expect_next_in:05d}"

    def cleanup(
        self,
        *,
        directory: Path,
        run_hash: str,
    ) -> "CheckIn":
        """
        Cleanups all the expired check-ins for the given run hash.

        This will remove all check-ins that are older than the current one.
        Returns the new current check-in.
        """
        pattern = self.generate_filename(run_hash=run_hash)
        *paths_to_remove, current_check_in_path = sorted(directory.glob(pattern))
        logger.info(f"found {len(paths_to_remove)} check-ins:")
        logger.info(f"the acting one: {current_check_in_path}")
        for path in paths_to_remove:
            logger.info(f"check-in {path} is being removed")
            path.unlink(missing_ok=True)
            time.sleep(0.2)  # TODO remove this artificial delay
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
        )
        new_path = directory / filename
        logger.info(f"touching check-in: {new_path}")

        time.sleep(0.4)  # TODO remove this artificial delay
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


class RunCheckIns:
    """
    A handler for check-ins for a given run.

    Uses filesystem to store the check-ins. Handles resumed `Run`s.
    Background thread is used to adjust the rate of check-ins written
    to the filesystem in order to avoid overloading.

    Calling `report_successful_finish()` is required to mark the run as
    finished, otherwise the run will be marked as failed.
    """

    instances: Set["RunCheckIns"] = set()

    def __init__(
        self,
        run: 'Run',
    ) -> None:
        logger.info(f"creating RunCheckIns for {run}")
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
        self.last_check_in = leftover.increment()
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
    def default(cls) -> "RunCheckIns":
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
        self.stop()
        self.instances.remove(self)

    def stop(self):
        """
        Flush the last check-in and stop the thread.
        """
        self.stop_signal.set()
        self.flush()
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
                logger.error(f"Missing check-in. Grace period expired { - GRACE_PERIOD - time_left} seconds ago. "
                             f"Alerts should be sent soon by the monitoring server.")
            elif time_left < 0:
                logger.warning(f"Missing check-in. Late: {-time_left} seconds. "
                               f"Remaining grace period: {GRACE_PERIOD + time_left} seconds")
            elif time_left < PLAN_ADVANCE_TIME:
                logger.info(f"Missing check-in. Time left: {time_left}")
            plan = max(time_left - PLAN_ADVANCE_TIME, 0.05)
            suspend_time = min(plan, MAX_SUSPEND_TIME)

            with self.flush_condition:
                self.flush_condition.wait(timeout=suspend_time)

            check_in = self.last_check_in
            if check_in != self.physical_check_in:
                logger.info(f"detected newest check-in: {check_in}")
                self.physical_check_in = check_in.touch(
                    directory=self.dir, run_hash=self.run_hash
                )
                logger.info(f"changing to -> {self.physical_check_in}")
                continue

            if self.stop_signal.is_set():
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
        block: bool = False,
    ) -> None:
        """
        Check-in and optionally mark an expiry date by setting `expect_next_in`.

        If `block` is True, then this will block until the check-in is flushed.
        """
        self.last_check_in = self.last_check_in.increment(expect_next_in=expect_next_in)
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
        return self._check_in(block=block)

    # The instance method `check_in` and `report_successful_finish` is patched into
    # the instance in `__post_init__`
    # so the same name is used for both the instance method and the class method.
    @classmethod
    def check_in(
        cls,
        *,
        expect_next_in: int = 0,
        block: bool = False,
    ) -> None:
        """
        Check-in and optionally mark an expiry date by setting `expect_next_in`.

        If `block` is True, then this will block until the check-in is flushed.

        Note: This is a classmethod and designed to be called like:
        `RunCheckIns.check_in(expect_next_in=10)`
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
        `RunCheckIns.report_successful_finish()`
        * If no instance is available, this will log a warning and return.
        * If multiple instances are available, this will raise an error.
        """
        default_instance = cls.default()
        if default_instance is None:
            return
        default_instance._report_successful_finish(block=block)
