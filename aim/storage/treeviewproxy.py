import struct

from aim.ext.transport.message_utils import ResourceObject
from aim.ext.transport.remote_resource import RemoteResourceAutoClean
from aim.storage.treeview import TreeView
from aim.storage.arrayview import TreeArrayView
from aim.storage.types import AimObject, AimObjectKey, AimObjectPath

from typing import TYPE_CHECKING, Iterator, Tuple, Union

if TYPE_CHECKING:
    from aim.ext.transport.client import Client


class ProxyTreeAutoClean(RemoteResourceAutoClean):
    PRIORITY = 60


class ProxyTree(TreeView):
    def __init__(self, client: 'Client',
                 name: str,
                 sub: str,
                 read_only: bool,
                 from_union: bool = False,
                 index=False,
                 timeout=None):
        self._resources: ProxyTreeAutoClean = None

        self._rpc_client = client
        read_only = struct.pack('?', read_only)
        from_union = struct.pack('?', from_union)
        index = struct.pack('?', index)
        timeout = struct.pack('I', timeout or 0)

        args = (name.encode(), sub.encode(), read_only, from_union, index, timeout)
        handler = self._rpc_client.get_resource_handler('TreeView', args=args)

        self._resources = ProxyTreeAutoClean(self)
        self._resources.rpc_client = client
        self._resources.handler = handler
        self._handler = handler

    def preload(self):
        self._rpc_client.run_instruction(self._handler, 'preload')

    def view(
        self,
        path: Union[AimObjectKey, AimObjectPath],
        resolve: bool = False
    ):
        subtree = SubtreeView(self, path)
        if not resolve:
            return subtree
        # TODO [AT, MV] handle resolve=True
        # make an rpc call to get underlying object type
        # and construct CustomObject if needed
        return None

    def make_array(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ):
        self._rpc_client.run_instruction(self._handler, 'make_array', (path,))

    def collect(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        strict: bool = True
    ) -> AimObject:
        return self._rpc_client.run_instruction(self._handler, 'collect', (path, strict))

    def __delitem__(
        self,
        path: Union[AimObjectKey, AimObjectPath]
    ):
        self._rpc_client.run_instruction(self._handler, '__delitem__', (path,))

    def __setitem__(
            self,
            path: Union[AimObjectKey, AimObjectPath],
            value: AimObject
    ):
        self._rpc_client.run_instruction(self._handler, '__setitem__', (path, value))

    def keys(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        level: int = None
    ) -> Iterator[Union[AimObjectPath, AimObjectKey]]:
        return self._rpc_client.run_instruction(self._handler, 'keys', (path, level))

    def items(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> Iterator[Tuple[
        AimObjectKey,
        AimObject
    ]]:
        return self._rpc_client.run_instruction(self._handler, 'items', (path,))

    def iterlevel(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        level: int = 1
    ) -> Iterator[Tuple[
        AimObjectPath,
        AimObject
    ]]:
        return self._rpc_client.run_instruction(self._handler, 'iterlevel', (path, level))

    def array(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> TreeArrayView:
        return TreeArrayView(self.subtree(path))

    def first(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> Tuple[AimObjectKey, AimObject]:
        return self._rpc_client.run_instruction(self._handler, 'first', (path,))

    def last(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> Tuple[AimObjectKey, AimObject]:
        return self._rpc_client.run_instruction(self._handler, 'last', (path,))

    def finalize(
        self,
        *,
        index: 'ProxyTree'
    ):
        self._rpc_client.run_instruction(self._handler, 'finalize', (ResourceObject(index._handler),))


class SubtreeView(TreeView):
    def __init__(self, tree: TreeView, path: Union[AimObjectKey, AimObjectPath]):
        self.tree = tree
        if path == Ellipsis:
            path = ()
        if not isinstance(path, (tuple, list)):
            path = (path,)
        self.prefix = path

    def absolute_path(self, path):
        if path == Ellipsis:
            path = ()
        if not isinstance(path, (tuple, list)):
            path = (path,)
        return self.prefix + path

    def preload(self):
        self.tree.preload()

    def view(
        self,
        path: Union[AimObjectKey, AimObjectPath],
        resolve: bool = False
    ):
        return self.tree.view(self.absolute_path(path), resolve)

    def make_array(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ):
        self.tree.make_array(self.absolute_path(path))

    def collect(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        strict: bool = True
    ) -> AimObject:
        return self.tree.collect(self.absolute_path(path), strict)

    def __delitem__(
        self,
        path: Union[AimObjectKey, AimObjectPath]
    ):
        del self.tree[self.absolute_path(path)]

    def __setitem__(
            self,
            path: Union[AimObjectKey, AimObjectPath],
            value: AimObject
    ):
        self.tree[self.absolute_path(path)] = value

    def keys(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        level: int = None
    ) -> Iterator[Union[AimObjectPath, AimObjectKey]]:
        return self.tree.keys(self.absolute_path(path))

    def items(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> Iterator[Tuple[
        AimObjectKey,
        AimObject
    ]]:
        return self.tree.items(self.absolute_path(path))

    def iterlevel(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        level: int = 1
    ) -> Iterator[Tuple[
        AimObjectPath,
        AimObject
    ]]:
        return self.tree.iterlevel(self.absolute_path(path), level)

    def array(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> TreeArrayView:
        return TreeArrayView(self.subtree(path))

    def first(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> Tuple[AimObjectKey, AimObject]:
        return self.tree.first(self.absolute_path(path))

    def last(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> Tuple[AimObjectKey, AimObject]:
        return self.tree.last(self.absolute_path(path))
