import contextlib
from typing import Optional, Union, List, Tuple, Iterator, Any

from aim._core.storage.treearrayview import TreeArrayView
from aim._core.storage.types import AimObjectKey, AimObjectPath, AimObject

from aimcore.transport.message_utils import pack_args, ResourceObject
from aimcore.transport.remote_resource import RemoteResourceAutoClean

from aim._sdk.storage_engine import StorageEngine

from aimcore.transport import Client

from aimcore.cleanup import AutoClean

from aim._core.storage.treeview import TreeView
from aim._core.storage.locking import ContainerLock
from aim._core.storage.treeutils import encode_tree
from aimcore.reporter import RunStatusReporter, FileManager


class RemoteStorage(StorageEngine):
    class AutoClean(AutoClean['RemoteStorage']):
        PRIORITY = 30

        def __init__(self, instance: 'RemoteStorage'):
            super().__init__(instance)
            self._client = instance._client
            self._queue = instance.task_queue()

        def _close(self):
            self._queue.wait_for_finish()
            self._queue.stop()
            self._client.disconnect()

    def __init__(self, path: str, read_only: bool = False):
        self.path = path
        remote_path = path.replace('aim://', '')
        self._client = Client(remote_path)
        self._read_only = read_only
        self._resource = RemoteStorage.AutoClean(self)

    @property
    def url(self) -> str:
        return self.path

    def tree(self, hash_: Optional[str], name: str, read_only: bool) -> TreeView:
        return RemoteTreeViewProxy(self._client, name, hash_, read_only=read_only)

    def lock(self, hash_: str, timeout: int = 10) -> ContainerLock:
        lock = RemoteLockProxy(self._client, hash_)
        lock.lock()
        return lock

    def status_reporter(self, hash_: str) -> RunStatusReporter:
        return RunStatusReporter(hash_, RemoteFileManagerProxy(self._client, hash_))

    @contextlib.contextmanager
    def write_batch(self, hash_: str):
        self._client.start_instructions_batch(hash_)
        yield
        self._client.flush_instructions_batch(hash_)

    def task_queue(self):
        return self._client.get_queue()

    def dev_package(self, name):
        return RemotePackageProxy(self._client, name)


class RemoteFileManagerProxy(FileManager):
    def __init__(self, client: 'Client', run_hash):
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


class RemoteTreeViewProxy(TreeView):
    class AutoClean(RemoteResourceAutoClean):
        PRIORITY = 60

    def __init__(self, client: 'Client',
                 name: str,
                 sub: str,
                 *,
                 read_only: bool,):
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

        self._resources = RemoteTreeViewProxy.AutoClean(self)
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

    def merge(
        self,
        path: Union[AimObjectKey, AimObjectPath],
        value: AimObject,
    ):
        self._rpc_client.run_instruction(self._hash, self._handler, 'merge', (path, value), is_write_only=True)

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
        index: 'RemoteTreeViewProxy'
    ):
        self._rpc_client.run_instruction(self._hash, self._handler, 'finalize', (ResourceObject(index._handler),))

    def reservoir(
            self,
            path: Union[AimObjectKey, AimObjectPath] = (),
    ):
        return RemoteKhashArrayProxy(self._rpc_client, self, path)


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

    def merge(
            self,
            path: Union[AimObjectKey, AimObjectPath],
            value: AimObject
    ):
        self.tree.merge(self.absolute_path(path), value)

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


class RemoteKhashArrayProxy(TreeArrayView):
    class AutoClean(RemoteResourceAutoClean):
        PRIORITY = 70

    def __init__(self, client: 'Client', tree: RemoteTreeViewProxy, path: AimObjectPath):
        self._rpc_client = client
        self._hash = tree._hash
        self.resource_type = 'KhashArrayView'

        kwargs = {
            'tree': ResourceObject(tree._handler),
            'path': path
        }
        self.init_args = pack_args(encode_tree(kwargs))
        handler = self._rpc_client.get_resource_handler(self, self.resource_type, args=self.init_args)

        self._resources = RemoteKhashArrayProxy.AutoClean(self)
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
        yield from zip(*self.sparse_list())

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

    def sparse_list(self) -> Tuple[List[int], List[Any]]:
        return self._rpc_client.run_instruction(self._hash, self._handler, 'sparse_list')

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


class RemoteLockProxy(ContainerLock):
    class AutoClean(RemoteResourceAutoClean):
        PRIORITY = 45

    def __init__(self, client: 'Client',
                 run_hash: str):
        self._rpc_client = client
        self._hash = run_hash

        kwargs = {
            'run_hash': run_hash,
        }
        self.init_args = pack_args(encode_tree(kwargs))
        self.resource_type = 'Lock'
        handler = self._rpc_client.get_resource_handler(self, self.resource_type, args=self.init_args)

        self._resources = RemoteLockProxy.AutoClean(self)
        self._resources.rpc_client = client
        self._resources.handler = handler
        self._handler = handler

    def lock(self, force: bool = False) -> None:
        return self._rpc_client.run_instruction(self._hash, self._handler, 'lock', (force,))

    def release(self, force: bool = False) -> None:
        return self._rpc_client.run_instruction(self._hash, self._handler, 'release', (force,))


class RemotePackageProxy:
    class AutoClean(RemoteResourceAutoClean):
        PRIORITY = 60

    def __init__(self, client: 'Client', name: str):
        self._rpc_client = client
        self._name = name
        self._hash = 0

        kwargs = {
            'name': name,
        }
        self.init_args = pack_args(encode_tree(kwargs))
        self.resource_type = 'Package'
        handler = self._rpc_client.get_resource_handler(self, self.resource_type, args=self.init_args)

        self._resources = RemoteLockProxy.AutoClean(self)
        self._resources.hash = self._hash
        self._resources.rpc_client = client
        self._resources.handler = handler
        self._handler = handler

    def install(self):
        return self._rpc_client.run_instruction(self._hash, self._handler, 'install', is_write_only=True)

    def sync(self, file, contents):
        return self._rpc_client.run_instruction(self._hash, self._handler, 'sync', (file, contents), is_write_only=True)

    def remove(self, file):
        return self._rpc_client.run_instruction(self._hash, self._handler, 'remove', (file,), is_write_only=True)

    def move(self, src, dest):
        return self._rpc_client.run_instruction(self._hash, self._handler, 'move', (src, dest), is_write_only=True)


class RemoteRepoProxy:
    class AutoClean(RemoteResourceAutoClean):
        PRIORITY = 60

    def __init__(self, client: 'Client'):
        self._rpc_client = client

        self.init_args = pack_args(encode_tree({}))
        self.resource_type = 'Repo'

        handler = self._rpc_client.get_resource_handler(self, self.resource_type, args=self.init_args)

        self._resources = RemoteRepoProxy.AutoClean(self)
        self._resources.rpc_client = client
        self._resources.handler = handler
        self._handler = handler

    def _delete_container(self, hash_):
        return self._rpc_client.run_instruction(-1, self._handler, '_delete_container', [hash_])

    def prune(self):
        return self._rpc_client.run_instruction(-1, self._handler, 'prune', [])

    def _close_container(self, hash_):
        return self._rpc_client.run_instruction(-1, self._handler, '_close_container', [hash_])

    def add_package(self, pkg_name: str):
        return self._rpc_client.run_instruction(-1, self._handler, 'add_package', [pkg_name])

    def remove_package(self, pkg_name: str):
        return self._rpc_client.run_instruction(-1, self._handler, 'remove_package', [pkg_name])
