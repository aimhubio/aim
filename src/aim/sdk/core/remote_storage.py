import contextlib
from typing import Optional

from aim.core.transport.message_utils import pack_args
from aim.core.transport.remote_resource import RemoteResourceAutoClean

from aim.sdk.core.storage_engine import StorageEngine

from aim.core.transport import Client

from aim.core.cleanup import AutoClean

from aim.core.storage.treeview import TreeView
from aim.core.storage.locking import ContainerLock
from aim.core.storage.lock_proxy import ProxyLock
from aim.core.storage.treeviewproxy import ProxyTree
from aim.core.storage.treeutils import encode_tree
from aim.core.reporter import RunStatusReporter, FileManager


class RemoteStorageAutoClean(AutoClean['RemoteStorage']):
    PRIORITY = 30

    def __init__(self, instance: 'RemoteStorage'):
        super().__init__(instance)
        self._client = instance._client

    def _close(self):
        self._client.disconnect()


class RemoteStorage(StorageEngine):
    def __init__(self, path: str, read_only: bool = False):
        self.path = path
        remote_path = path.replace('aim://', '')
        self._client = Client(remote_path)
        self._read_only = read_only
        self._resource = RemoteStorageAutoClean(self)

    @property
    def url(self) -> str:
        return self.path

    def tree(self, hash_: Optional[str], name: str, read_only: bool) -> TreeView:
        return ProxyTree(self._client, name, hash_, read_only=read_only)

    def lock(self, hash_: str, timeout: int = 10) -> ContainerLock:
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


class RemoteFileManager(FileManager):
    def __init__(self, client: 'Client', run_hash):
        self._resources: RemoteResourceAutoClean = None

        self._rpc_client = client
        self._hash = run_hash

        self.init_args = pack_args(encode_tree({}))
        self.resource_type = 'FileManager'
        handler = self._rpc_client.get_resource_handler(self, self.resource_type, args=self.init_args)

        self._resources = RemoteResourceAutoClean(self)
        self._resources.rpc_client = client
        self._resources.handler = handler
        self._handler = handler

    def poll(self, pattern: str) -> Optional[str]:
        return self._rpc_client.run_instruction(
            self._hash, self._handler, 'poll', (pattern,))

    def touch(self, filename: str, cleanup_file_pattern: Optional[str] = None):
        self._rpc_client.run_instruction(
            self._hash, self._handler, 'touch', (filename, cleanup_file_pattern), is_write_only=True)
