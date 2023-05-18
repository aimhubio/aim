import contextlib

from aim.sdk.core.storage_engine import StorageEngine

from aim.core.storage.treeview import TreeView
from aim.core.storage.rockscontainer import RocksContainer
from aim.core.storage.container import Container as StorageContainer
from aim.core.storage.locking import ContainerLock
from aim.sdk.lock_manager import LockManager
from aim.sdk.reporter import RunStatusReporter
from aim.sdk.reporter.file_manager import LocalFileManager


class LocalStorage(StorageEngine):
    def __init__(self, path: str, read_only: bool = True):
        self.root_path: str = path
        self.path: str = f'{path}/data'
        self.container: StorageContainer = RocksContainer(path, read_only=read_only)
        self.root_tree: TreeView = self.container.tree()
        self._lock_manager = LockManager(self.path)

    @property
    def url(self):
        return self.path

    def tree(self, hash_: str, name: str, read_only: bool) -> TreeView:
        return self.root_tree.subtree(name)

    def lock(self, hash_: str, timeout: int) -> 'ContainerLock':
        lock = self._lock_manager.get_run_lock(hash_, timeout)
        lock.lock()
        return lock

    def status_reporter(self, hash_: str) -> RunStatusReporter:
        return RunStatusReporter(hash_, LocalFileManager(self.path))

    @contextlib.contextmanager
    def write_batch(self, hash_: str):
        yield

    def task_queue(self, hash_: str):
        return None

    def remove_queue(self, hash_: str):
        pass
