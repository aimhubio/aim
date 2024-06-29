import datetime
import logging
import os
import time
import uuid
import weakref

from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Union

import psutil

from aim.sdk.errors import RunLockingError
from aim.storage.locking import RunLock
from dateutil.relativedelta import relativedelta
from filelock import SoftFileLock, Timeout, UnixFileLock


logger = logging.getLogger(__name__)


class LockingVersion(Enum):
    LEGACY = 0
    NEW = 1


class LockType(Enum):
    SOFT_LOCK = 0
    UNIX_LOCK = 1


@dataclass(frozen=True)
class LockInfo:
    run_hash: str = field()
    locked: bool = field(default=False)
    version: LockingVersion = field(default=LockingVersion.NEW)
    type: LockType = field(default=LockType.SOFT_LOCK)
    created_at: datetime.datetime = field(default=None)

    def age(self, to=None) -> str:
        if self.created_at is None:
            return 'N/A'
        to = to or datetime.datetime.now()
        delta = relativedelta(to, self.created_at)
        date_attrs = ('years', 'months', 'days', 'hours', 'minutes', 'seconds')
        for attr in date_attrs:
            if getattr(delta, attr) > 1:
                return f'~{getattr(delta, attr)} {attr}'
            elif getattr(delta, attr) == 1:
                return f'~{getattr(delta, attr)} {attr[:-1]}'


class SFRunLock(RunLock):
    def __init__(self, lock_manager: 'LockManager', run_hash: str, path: Path, timeout: int):
        self.run_hash = run_hash
        self._lock_manager = weakref.ref(lock_manager)
        self._sf_lock = SoftFileLock(path, timeout=timeout)

    def lock(self, force: bool = False):
        self._lock_manager().lock(self.run_hash, self._sf_lock, force=force)

    def release(self, force: bool = False) -> None:
        self._sf_lock.release(force=force)


class LockManager(object):
    machine_id = uuid.getnode()
    pid = os.getpid()

    def __init__(self, repo_path: Union[str, Path]):
        self.repo_path = Path(repo_path)
        self.locks_path = self.repo_path / 'locks'
        self.locks_path.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def softlock_fname(name: str) -> str:
        return f'{name}.softlock'

    def get_run_lock_info(self, run_hash: str) -> LockInfo:
        # check locks created prior to 3.15 version
        locked = False
        created_at = None
        lock_version = None
        lock_type = None

        run_lock_path = self.locks_path / self.softlock_fname(run_hash)
        if run_lock_path.exists():
            locked = True
            created_at = datetime.datetime.fromtimestamp(run_lock_path.stat().st_mtime)
            lock_version = LockingVersion.NEW
            lock_type = LockType.SOFT_LOCK
        else:
            # consider Run as locked if one of it's containers is locked
            for container_dir in ('meta', 'seqs'):
                lock_dir = self.repo_path / container_dir / 'locks'
                lock_path = lock_dir / run_hash
                soft_lock_path = lock_dir / self.softlock_fname(run_hash)
                if lock_path.exists():
                    try:
                        lock = UnixFileLock(lock_path, timeout=0)
                        with lock.acquire():
                            pass
                    except Timeout:
                        locked = True
                        lock_version = LockingVersion.LEGACY
                        lock_type = LockType.UNIX_LOCK
                elif soft_lock_path.exists():
                    locked = True
                    created_at = datetime.datetime.fromtimestamp(soft_lock_path.stat().st_mtime)
                    lock_version = LockingVersion.LEGACY
                    lock_type = LockType.SOFT_LOCK

        return LockInfo(run_hash=run_hash, locked=locked, created_at=created_at, version=lock_version, type=lock_type)

    def get_run_lock(self, run_hash: str, timeout: int = 10) -> RunLock:
        lock_path = self.locks_path / self.softlock_fname(run_hash)
        return SFRunLock(self, run_hash, lock_path, timeout=timeout)

    def lock(self, run_hash: str, run_lock: SoftFileLock, force: bool = False):
        lock_path = Path(run_lock.lock_file)

        if force:
            logger.warning(
                f"Force-releasing locks for Run '{run_hash}'. Data corruption may occur if there is "
                f"active process writing to Run '{run_hash}'."
            )
            self.release_locks(run_hash, force=True)
        elif not self.release_locks(run_hash, force=False):
            raise RunLockingError(
                f"Cannot acquire lock for Run '{run_hash}'. "
                f"Make sure no process uses Run '{run_hash}' and close it via Aim CLI:\n"
                f'`aim runs close --force {run_hash}`'
            )
        run_lock.acquire()
        with open(lock_path, 'w') as lock_metadata_fh:
            lock_metadata_fh.write(f'{self.machine_id}-{self.pid}-{time.time()}')

    def release_locks(self, run_hash: str, force: bool) -> bool:
        success = True
        lock_path = self.locks_path / self.softlock_fname(run_hash)
        if force:
            # Force-release container locks if any
            for container_dir in ('meta', 'seqs'):
                soft_lock_path = self.repo_path / container_dir / 'locks' / self.softlock_fname(run_hash)
                if soft_lock_path.exists():
                    soft_lock_path.unlink()
                unix_lock_path = self.repo_path / container_dir / 'locks' / run_hash
                if unix_lock_path.exists():
                    unix_lock_path.unlink()

            # Force-release run lock
            if lock_path.exists():
                lock_path.unlink()
        else:
            lock_info = self.get_run_lock_info(run_hash)
            if lock_info.locked and lock_info.version == LockingVersion.LEGACY:
                success = False
            elif lock_info.locked and self.is_stalled_lock(lock_path):
                assert lock_info.version == LockingVersion.NEW
                logger.info(f"Detected stalled lock for Run '{run_hash}'. Removing lock.")
                lock_path.unlink()
        return success

    def is_stalled_lock(self, lock_file_path: Path) -> bool:
        with open(lock_file_path, mode='r') as lock_metadata_fh:
            machine_id, pid, *_ = lock_metadata_fh.read().split('-')
            if int(machine_id) == self.machine_id and not psutil.pid_exists(int(pid)):
                return True
        return False
