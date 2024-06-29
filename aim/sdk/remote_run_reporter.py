from typing import TYPE_CHECKING, Optional

from aim.ext.transport.message_utils import pack_args
from aim.ext.transport.remote_resource import RemoteResourceAutoClean
from aim.sdk.reporter.file_manager import FileManager
from aim.storage.treeutils import encode_tree


if TYPE_CHECKING:
    from aim.ext.transport.client import Client


class RunHeartbeatReporterAutoClean(RemoteResourceAutoClean):
    PRIORITY = 60


class RemoteRunHeartbeatReporter:
    def __init__(self, client: 'Client', run_hash: str):
        self._resources: RunHeartbeatReporterAutoClean = None

        self._rpc_client = client
        self._hash = run_hash

        kwargs = {
            'run_hash': run_hash,
        }
        self.init_args = pack_args(encode_tree(kwargs))
        self.resource_type = 'RunHeartbeat'
        handler = self._rpc_client.get_resource_handler(self, self.resource_type, args=self.init_args)

        self._resources = RunHeartbeatReporterAutoClean(self)
        self._resources.rpc_client = client
        self._resources.handler = handler
        self._handler = handler

    def stop(self):
        self._rpc_client.run_instruction(self._hash, self._handler, 'stop')


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
        return self._rpc_client.run_instruction(self._hash, self._handler, 'poll', (pattern,))

    def touch(self, filename: str, cleanup_file_pattern: Optional[str] = None):
        self._rpc_client.run_instruction(
            self._hash, self._handler, 'touch', (filename, cleanup_file_pattern), is_write_only=True
        )
