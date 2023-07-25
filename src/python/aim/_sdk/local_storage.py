import contextlib
import logging

from pathlib import Path
from typing import Union, Optional

from aim._sdk.storage_engine import StorageEngine

from aim._core.storage.treeview import TreeView
from aim._core.storage.rockscontainer import RocksContainer
from aim._core.storage.container import Container as StorageContainer
from aim._core.storage.locking import ContainerLock
from aim._sdk.lock_manager import LockManager
from aim._sdk.dev_package import DevPackage
from aimcore.reporter import RunStatusReporter, FileManager

logger = logging.getLogger(__name__)


class LocalStorage(StorageEngine):
    def __init__(self, path: str, read_only: bool = True):
        self.root_path: str = path
        self.pkgs_path: str = f'{path}/pkgs'
        self.path: str = f'{path}/data'
        self._lock_manager = LockManager(self.root_path)
        self.container: StorageContainer = RocksContainer(self.path, read_only=read_only)
        self.root_tree: TreeView = self.container.tree()

    @property
    def url(self):
        return self.path

    def tree(self, hash_: Optional[str], name: str, read_only: bool) -> TreeView:
        return self.root_tree.subtree(name)

    def lock(self, hash_: str, timeout: int = 10) -> 'ContainerLock':
        lock = self._lock_manager.get_container_lock(hash_, timeout)
        lock.lock()
        return lock

    def status_reporter(self, hash_: str) -> RunStatusReporter:
        return RunStatusReporter(hash_, LocalFileManager(self.path))

    @contextlib.contextmanager
    def write_batch(self, hash_: str):
        yield

    def task_queue(self):
        return None

    def dev_package(self, name):
        return DevPackage(self.pkgs_path, name)


class LocalFileManager(FileManager):
    def __init__(self, base_dir: Union[Path, str], watch_dir_name: Optional[str] = 'check_ins'):
        if not isinstance(base_dir, Path):
            base_dir = Path(base_dir)

        self.base_dir = base_dir / watch_dir_name

    def __repr__(self):
        return repr(self.base_dir)

    def poll(self, pattern: str) -> Optional[str]:
        paths = list(self.base_dir.glob(pattern))
        if not paths:
            return None
        return max(paths).name

    def touch(self, filename: str, cleanup_file_pattern: Optional[str] = None):
        self.base_dir.mkdir(parents=True, exist_ok=True)
        new_path = self.base_dir / filename
        logger.debug(f"touching check-in: {new_path}")
        new_path.touch(exist_ok=True)
        if cleanup_file_pattern is not None:
            self._cleanup(cleanup_file_pattern)

    def _cleanup(self, pattern: str) -> Path:
        *paths_to_remove, max_path = sorted(self.base_dir.glob(pattern))
        logger.debug(f"found {len(paths_to_remove)} check-ins:")
        logger.debug(f"the acting one: {max_path}")

        for path in paths_to_remove:
            logger.debug(f"check-in {path} is being removed")
            try:
                # Ignore errors, as the file may have been removed already.
                path.unlink()
            except OSError:
                pass
            logger.debug(f"check-in {path} removed")

        return max_path
