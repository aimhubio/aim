from typing import TYPE_CHECKING
from aim.storage.treeutils import encode_tree
from aim.ext.transport.message_utils import pack_args

from aim.ext.transport.remote_resource import RemoteResourceAutoClean

if TYPE_CHECKING:
    from aim.ext.transport.client import Client


class RemoteRepoAutoClean(RemoteResourceAutoClean):
    PRIORITY = 60


class RemoteRepoProxy:
    def __init__(self, client: 'Client'):
        self._rpc_client = client

        self.init_args = pack_args(encode_tree({}))
        self.resource_type = 'Repo'

        handler = self._rpc_client.get_resource_handler(self, self.resource_type, args=self.init_args)

        self._resources = RemoteRepoAutoClean(self)
        self._resources.rpc_client = client
        self._resources.handler = handler
        self._handler = handler

    def list_all_runs(self):
        return self._rpc_client.run_instruction(-1, self._handler, 'list_all_runs', [])

    def list_active_runs(self):
        return self._rpc_client.run_instruction(-1, self._handler, 'list_active_runs', [])

    def delete_run(self, hash_):
        return self._rpc_client.run_instruction(-1, self._handler, 'delete_run', [hash_])

    def prune(self):
        return self._rpc_client.run_instruction(-1, self._handler, 'prune', [])

    def _backup_run(self, hash_):
        return self._rpc_client.run_instruction(-1, self._handler, '_backup_run', [hash_])

    def _restore_run(self, hash_):
        return self._rpc_client.run_instruction(-1, self._handler, '_restore_run', [hash_])

    def _close_run(self, hash_):
        return self._rpc_client.run_instruction(-1, self._handler, '_close_run', [hash_])
