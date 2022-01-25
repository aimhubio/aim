import struct

from typing import TYPE_CHECKING, List
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
        read_only = struct.pack('?', read_only)
        args = (hash_.encode(), read_only)
        handler = self._rpc_client.get_resource_handler('StructuredRun', args=args)

        self._resources = RunProxyAutoClean(self)
        self._resources.rpc_client = client
        self._resources.handler = handler
        self._handler = handler

    @property
    def name(self):
        return self._rpc_client.run_instruction(self._handler, 'name', [])

    @name.setter
    def name(self, value):
        self._rpc_client.run_instruction(self._handler, 'name.setter', (value,))

    @property
    def description(self):
        return self._rpc_client.run_instruction(self._handler, 'description', [])

    @description.setter
    def description(self, value):
        self._rpc_client.run_instruction(self._handler, 'description.setter', (value,))

    @property
    def archived(self):
        return self._rpc_client.run_instruction(self._handler, 'archived', [])

    @archived.setter
    def archived(self, value):
        self._rpc_client.run_instruction(self._handler, 'archived.setter', (value,))

    @property
    def creation_time(self):
        return self._rpc_client.run_instruction(self._handler, 'creation_time', [])

    @property
    def end_time(self):
        return self._rpc_client.run_instruction(self._handler, 'end_time', [])

    @property
    def experiment(self):
        return self._rpc_client.run_instruction(self._handler, 'experiment', [])

    @experiment.setter
    def experiment(self, value: str):
        self._rpc_client.run_instruction(self._handler, 'experiment.setter', (value,))

    @property
    def tags(self) -> List[str]:
        return self._rpc_client.run_instruction(self._handler, 'tags', [])

    def add_tag(self, value: str) -> str:
        return self._rpc_client.run_instruction(self._handler, 'add_tag', (value,))

    def remove_tag(self, value: str) -> bool:
        return self._rpc_client.run_instruction(self._handler, 'remove_tag', (value,))
