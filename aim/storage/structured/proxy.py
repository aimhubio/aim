from typing import TYPE_CHECKING, List

from aim.storage.treeutils import encode_tree
from aim.ext.transport.message_utils import pack_args
from aim.ext.transport.remote_resource import RemoteResourceAutoClean

if TYPE_CHECKING:
    from aim.ext.transport.client import Client


class RunProxyAutoClean(RemoteResourceAutoClean):
    PRIORITY = 60


class StructuredRunProxy:
    def __init__(self, client: 'Client',
                 hash_: str,
                 read_only: bool):
        self._resources: RunProxyAutoClean = None
        self._rpc_client = client
        kwargs = {
            'hash_': hash_,
            'read_only': read_only,
        }
        args = pack_args(encode_tree(kwargs))
        handler = self._rpc_client.get_resource_handler('StructuredRun', args=args)
        self._hash = hash_

        self._resources = RunProxyAutoClean(self)
        self._resources.rpc_client = client
        self._resources.handler = handler
        self._handler = handler

    @property
    def name(self):
        return self._rpc_client.run_instruction(self._hash, self._handler, 'name', [])

    @name.setter
    def name(self, value):
        self._rpc_client.run_instruction(self._hash, self._handler, 'name.setter', (value,), is_write_only=True)

    @property
    def description(self):
        return self._rpc_client.run_instruction(self._hash, self._handler, 'description', [])

    @description.setter
    def description(self, value):
        self._rpc_client.run_instruction(self._hash, self._handler, 'description.setter', (value,), is_write_only=True)

    @property
    def archived(self):
        return self._rpc_client.run_instruction(self._hash, self._handler, 'archived', [])

    @archived.setter
    def archived(self, value):
        self._rpc_client.run_instruction(self._hash, self._handler, 'archived.setter', (value,), is_write_only=True)

    @property
    def creation_time(self):
        return self._rpc_client.run_instruction(self._hash, self._handler, 'creation_time', [])

    @property
    def end_time(self):
        return self._rpc_client.run_instruction(self._hash, self._handler, 'end_time', [])

    @property
    def experiment(self):
        return self._rpc_client.run_instruction(self._hash, self._handler, 'experiment', [])

    @experiment.setter
    def experiment(self, value: str):
        self._rpc_client.run_instruction(self._hash, self._handler, 'experiment.setter', (value,), is_write_only=True)

    @property
    def tags(self) -> List[str]:
        return self._rpc_client.run_instruction(self._hash, self._handler, 'tags', [])

    def add_tag(self, value: str) -> str:
        return self._rpc_client.run_instruction(self._hash, self._handler, 'add_tag', (value,))

    def remove_tag(self, value: str) -> bool:
        return self._rpc_client.run_instruction(self._hash, self._handler, 'remove_tag', (value,))
