import struct

from typing import TYPE_CHECKING, List

if TYPE_CHECKING:
    from aim.ext.transport.client import Client


class StructuredRunProxy:
    def __init__(self, client: 'Client',
                 hash_: str,
                 read_only: bool):
        self._rpc_client = client
        read_only = struct.pack('?', read_only)
        args = (hash_.encode(), read_only)
        handler = self._rpc_client.get_resource_handler('StructuredRun', args=args)

        if handler is None:
            raise ValueError

        self._handler = handler

    @property
    def name(self):
        remote = self._rpc_client
        return remote.run_instruction(self._handler, 'name', [])

    @name.setter
    def name(self, value):
        remote = self._rpc_client
        remote.run_instruction(self._handler, 'name.setter', (value,))

    @property
    def description(self):
        remote = self._rpc_client
        return remote.run_instruction(self._handler, 'description', [])

    @description.setter
    def description(self, value):
        remote = self._rpc_client
        remote.run_instruction(self._handler, 'description.setter', (value,))

    @property
    def archived(self):
        remote = self._rpc_client
        return remote.run_instruction(self._handler, 'archived', [])

    @archived.setter
    def archived(self, value):
        remote = self._rpc_client
        remote.run_instruction(self._handler, 'archived.setter', (value,))

    @property
    def creation_time(self):
        remote = self._rpc_client
        return remote.run_instruction(self._handler, 'creation_time', [])

    @property
    def end_time(self):
        remote = self._rpc_client
        return remote.run_instruction(self._handler, 'end_time', [])

    @property
    def experiment(self):
        remote = self._rpc_client
        return remote.run_instruction(self._handler, 'experiment', [])

    @experiment.setter
    def experiment(self, value: str):
        remote = self._rpc_client
        remote.run_instruction(self._handler, 'experiment.setter', (value,))

    @property
    def tags(self) -> List[str]:
        remote = self._rpc_client
        return remote.run_instruction(self._handler, 'tags', [])

    def add_tag(self, value: str) -> str:
        remote = self._rpc_client
        return remote.run_instruction(self._handler, 'add_tag', (value,))

    def remove_tag(self, value: str) -> bool:
        remote = self._rpc_client
        return remote.run_instruction(self._handler, 'remove_tag', (value,))
