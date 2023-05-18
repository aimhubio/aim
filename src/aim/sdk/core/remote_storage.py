import contextlib

from aim.sdk.core.storage_engine import StorageEngine

from aim.core.transport import Client

from aim.core.storage.treeview import TreeView
from aim.core.storage.locking import ContainerLock
from aim.core.storage.lock_proxy import ProxyLock
from aim.core.storage.treeviewproxy import ProxyTree
from aim.sdk.reporter import RunStatusReporter
from aim.sdk.remote_run_reporter import RemoteFileManager


class RemoteStorage(StorageEngine):
    def __init__(self, path: str):
        self.path = path
        remote_path = path.replace('aim://', '')
        self._client = Client(remote_path)

    @property
    def url(self) -> str:
        return self.path

    def tree(self, hash_: str, name: str, read_only: bool) -> TreeView:
        return ProxyTree(self._client, name, hash_, read_only=read_only)

    def lock(self, hash_: str, timeout: int) -> ContainerLock:
        lock = ProxyLock(self._client, hash_)
        lock.lock()
        return lock

    def status_reporter(self, hash_: str) -> RunStatusReporter:
        return RunStatusReporter(hash_, RemoteFileManager(self._client, hash_))

    @contextlib.contextmanager
    def write_batch(self, hash_: str):
        self._client.start_instructions_batch()
        yield
        self._client.flush_instructions_batch(hash_)

    def task_queue(self, hash_: str):
        return self._client.get_queue(hash_)

    def remove_queue(self, hash_: str):
        self._client.remove_queue(hash_)