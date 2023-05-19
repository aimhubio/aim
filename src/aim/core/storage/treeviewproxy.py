from aim.core.transport.message_utils import ResourceObject, pack_args
from aim.core.transport.remote_resource import RemoteResourceAutoClean

from aim.core.storage.treeview import TreeView
from aim.core.storage.treeutils import encode_tree
from aim.core.storage.treearrayview import TreeArrayView
from aim.core.storage.types import AimObject, AimObjectKey, AimObjectPath

from typing import TYPE_CHECKING, Any, Iterator, Tuple, Union, List


if TYPE_CHECKING:
    from aim.core.transport import Client


class ProxyTreeAutoClean(RemoteResourceAutoClean):
    PRIORITY = 60


class ProxyKhashArrayAutoClean(RemoteResourceAutoClean):
    PRIORITY = 70


class ProxyTree(TreeView):
    def __init__(self, client: 'Client',
                 name: str,
                 sub: str,
                 *,
                 read_only: bool,):
        self._resources: ProxyTreeAutoClean = None

        self._rpc_client = client
        self._hash = sub

        kwargs = {
            'name': name,
            'sub': sub,
            'read_only': read_only,
        }
        self.init_args = pack_args(encode_tree(kwargs))
        self.resource_type = 'TreeView'
        handler = self._rpc_client.get_resource_handler(self, self.resource_type, args=self.init_args)

        self._resources = ProxyTreeAutoClean(self)
        self._resources.hash = sub
        self._resources.rpc_client = client
        self._resources.handler = handler
        self._handler = handler

    def preload(self):
        self._rpc_client.run_instruction(self._hash, self._handler, 'preload')

    def view(
        self,
        path: Union[AimObjectKey, AimObjectPath],
        resolve: bool = False
    ):
        if resolve:
            return None
        # TODO [AT, MV] handle resolve=True
        # make an rpc call to get underlying object type
        # and construct CustomObject if needed
        return SubtreeView(self, path)

    def make_array(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ):
        self._rpc_client.run_instruction(self._hash, self._handler, 'make_array', (path,), is_write_only=True)

    def collect(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        strict: bool = True,
        resolve_objects: bool = False
    ) -> AimObject:
        return self._rpc_client.run_instruction(self._hash, self._handler, 'collect', (path, strict, resolve_objects))

    def __delitem__(
        self,
        path: Union[AimObjectKey, AimObjectPath]
    ):
        self._rpc_client.run_instruction(self._hash, self._handler, '__delitem__', (path,), is_write_only=True)

    def set(
        self,
        path: Union[AimObjectKey, AimObjectPath],
        value: AimObject,
        strict: bool = True
    ):
        self._rpc_client.run_instruction(self._hash, self._handler, 'set', (path, value, strict), is_write_only=True)

    def __setitem__(
        self,
        path: Union[AimObjectKey, AimObjectPath],
        value: AimObject
    ):
        self._rpc_client.run_instruction(self._hash, self._handler, '__setitem__', (path, value), is_write_only=True)

    def keys_eager(
            self,
            path: Union[AimObjectKey, AimObjectPath] = (),
    ) -> List[Union[AimObjectPath, AimObjectKey]]:
        return self._rpc_client.run_instruction(self._hash, self._handler, 'keys_eager', (path,))

    def keys(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        level: int = None
    ) -> List[Union[AimObjectPath, AimObjectKey]]:
        return self.keys_eager(path)

    def items_eager(
            self,
            path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> List[Tuple[
        AimObjectKey,
        AimObject
    ]]:
        return self._rpc_client.run_instruction(self._hash, self._handler, 'items_eager', (path,))

    def items(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> Iterator[Tuple[
        AimObjectKey,
        AimObject
    ]]:
        return self.items_eager(path)

    def iterlevel(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        level: int = 1
    ) -> Iterator[Tuple[
        AimObjectPath,
        AimObject
    ]]:
        return self._rpc_client.run_instruction(self._hash, self._handler, 'iterlevel', (path, level))

    def array(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        dtype: Any = None
    ) -> TreeArrayView:
        return TreeArrayView(self.subtree(path), dtype=dtype)

    def first_key(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> AimObjectKey:
        return self._rpc_client.run_instruction(self._hash, self._handler, 'first_key', (path,))

    def last_key(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> AimObjectKey:
        return self._rpc_client.run_instruction(self._hash, self._handler, 'last_key', (path,))

    def finalize(
        self,
        index: 'ProxyTree'
    ):
        self._rpc_client.run_instruction(self._hash, self._handler, 'finalize', (ResourceObject(index._handler),))

    def reservoir(
            self,
            path: Union[AimObjectKey, AimObjectPath] = (),
    ):
        return ProxyKhashArrayView(self._rpc_client, self, path)


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
        strict: bool = True,
        resolve_objects: bool = False
    ) -> AimObject:
        return self.tree.collect(self.absolute_path(path), strict, resolve_objects)

    def __delitem__(
        self,
        path: Union[AimObjectKey, AimObjectPath]
    ):
        del self.tree[self.absolute_path(path)]

    def set(
        self,
        path: Union[AimObjectKey, AimObjectPath],
        value: AimObject,
        strict: bool = True
    ):
        self.tree.set(self.absolute_path(path), value, strict)

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
        path: Union[AimObjectKey, AimObjectPath] = (),
        dtype: Any = None
    ) -> TreeArrayView:
        return TreeArrayView(self.subtree(path), dtype=dtype)

    def first_key(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> AimObjectKey:
        return self.tree.first_key(self.absolute_path(path))

    def last_key(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> AimObjectKey:
        return self.tree.last_key(self.absolute_path(path))

    def finalize(
        self,
        index: 'SubtreeView'
    ):
        self.tree.finalize(index=index.tree)

    def reservoir(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
    ):
        return self.tree.reservoir(self.absolute_path(path))


class ProxyKhashArrayView(TreeArrayView):
    def __init__(self, client: 'Client', tree: ProxyTree, path: AimObjectPath):
        self._resources: ProxyKhashArrayAutoClean = None
        self._rpc_client = client
        self._hash = tree._hash
        self.resource_type = 'KhashArrayView'

        kwargs = {
            'tree': ResourceObject(tree._handler),
            'path': path
        }
        self.init_args = pack_args(encode_tree(kwargs))
        handler = self._rpc_client.get_resource_handler(self, self.resource_type, args=self.init_args)

        self._resources = ProxyKhashArrayAutoClean(self)
        self._resources.hash = self._hash
        self._resources.rpc_client = client
        self._resources.handler = handler
        self._handler = handler

    def sample(
        self,
        num_samples: int = 512,
        begin: int = None,
        end: int = None,
    ) -> List[Tuple[
        int,
        Any
    ]]:
        return self._rpc_client.run_instruction(self._hash, self._handler, 'sample', (num_samples, begin, end))

    def __iter__(self) -> Iterator[Any]:
        yield from self.values_list()

    def keys(self) -> Iterator[int]:
        yield from self.indices_list()

    def indices(self) -> Iterator[int]:
        yield from self.indices_list()

    def values(self) -> Iterator[Any]:
        yield from self.values_list()

    def items(self) -> Iterator[Tuple[int, Any]]:
        yield from zip(self.indices_list(), self.values_list())

    def __len__(self) -> int:
        return self._rpc_client.run_instruction(self._hash, self._handler, '__len__')

    def __getitem__(
        self,
        idx: Union[int, slice]
    ) -> Any:
        return self._rpc_client.run_instruction(self._hash, self._handler, '__getitem__', (idx,))

    def __setitem__(
        self,
        idx: int,
        val: Any
    ):
        assert isinstance(idx, int)
        return self._rpc_client.run_instruction(self._hash, self._handler, '__setitem__', (idx, val),
                                                is_write_only=True)

    def indices_list(self) -> List[int]:
        return self._rpc_client.run_instruction(self._hash, self._handler, 'indices_list')

    def values_list(self) -> List[Any]:
        return self._rpc_client.run_instruction(self._hash, self._handler, 'values_list')

    def tolist(self) -> List[Any]:
        return self._rpc_client.run_instruction(self._hash, self._handler, 'tolist')

    def first(self) -> Tuple[int, Any]:
        return self._rpc_client.run_instruction(self._hash, self._handler, 'first')

    def first_idx(self) -> int:
        return self._rpc_client.run_instruction(self._hash, self._handler, 'first_idx')

    def first_value(self) -> Any:
        return self._rpc_client.run_instruction(self._hash, self._handler, 'first_value')

    def last(self) -> Tuple[int, Any]:
        return self._rpc_client.run_instruction(self._hash, self._handler, 'last')

    def last_idx(self) -> int:
        return self._rpc_client.run_instruction(self._hash, self._handler, 'last_idx')

    def last_value(self) -> Any:
        return self._rpc_client.run_instruction(self._hash, self._handler, 'last_value')
