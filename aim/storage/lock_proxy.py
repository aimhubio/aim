from typing import TYPE_CHECKING

from aim.ext.transport.message_utils import pack_args
from aim.ext.transport.remote_resource import RemoteResourceAutoClean
from aim.storage.locking import RunLock
from aim.storage.treeutils import encode_tree


if TYPE_CHECKING:
    from aim.ext.transport.client import Client


class ProxyLockAutoClean(RemoteResourceAutoClean):
    PRIORITY = 45


class ProxyLock(RunLock):
    def __init__(self, client: 'Client', run_hash: str):
        self._resources: ProxyLockAutoClean = None

        self._rpc_client = client
        self._hash = run_hash

        kwargs = {
            'run_hash': run_hash,
        }
        self.init_args = pack_args(encode_tree(kwargs))
        self.resource_type = 'Lock'
        handler = self._rpc_client.get_resource_handler(self, self.resource_type, args=self.init_args)

        self._resources = ProxyLockAutoClean(self)
        self._resources.rpc_client = client
        self._resources.handler = handler
        self._handler = handler

    def lock(self, force: bool = False) -> None:
        return self._rpc_client.run_instruction(self._hash, self._handler, 'lock', (force,))

    def release(self, force: bool = False) -> None:
        return self._rpc_client.run_instruction(self._hash, self._handler, 'release', (force,))
