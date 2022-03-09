from aim.storage import encoding as E
from aim.storage.encoding.encoding import decode
from aim.storage.object import CustomObject
from aim.storage.types import AimObject, AimObjectKey, AimObjectPath
from aim.storage.utils import ArrayFlag, CustomObjectFlagType
from aim.storage.container import Container
from aim.storage import treeutils
from aim.storage.treearrayview import TreeArrayView

from typing import Any, Iterator, Tuple, Union, List

from aim.storage.treeview import TreeView


class ContainerTreeView(TreeView):
    def __init__(
        self,
        container: Container
    ) -> None:
        self.container = container

    def preload(
        self
    ):
        self.container.preload()

    def finalize(
        self,
        *,
        index: 'ContainerTreeView'
    ):
        self.container.finalize(index=index.container)

    def view(
        self,
        path: Union[AimObjectKey, AimObjectPath],
        resolve: bool = False
    ):
        prefix = E.encode_path(path)

        container_view = self.container.view(prefix)
        tree_view = ContainerTreeView(container_view)
        # Okay, but let's decide if we want to initialize a CustomObject view
        if not resolve:
            return tree_view

        flag = decode(container_view.get(b'', default=b'\0'))
        if isinstance(flag, CustomObjectFlagType):
            return CustomObject._aim_decode(flag.aim_name, tree_view)

        return tree_view

    def make_array(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ):
        prefix = E.encode_path(path)
        self.container[prefix] = E.encode(ArrayFlag)

    def collect(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        strict: bool = True,
        resolve_objects: bool = False
    ) -> AimObject:
        if path == Ellipsis:
            path = ()
        if isinstance(path, (int, str)):
            path = (path,)
        prefix = E.encode_path(path)
        it = self.container.view(prefix).items()
        try:
            return treeutils.decode_tree(it, strict=strict, resolve_objects=resolve_objects)
        except KeyError:
            raise KeyError('No key {} is present.'.format(path))

    def __delitem__(
        self,
        path: Union[AimObjectKey, AimObjectPath]
    ):
        if path == Ellipsis:
            path = ()
        if not isinstance(path, (tuple, list)):
            path = (path,)
        encoded_path = E.encode_path(path)
        return self.container.delete_range(encoded_path, encoded_path + b'\xff')

    def set(
        self,
        path: Union[AimObjectKey, AimObjectPath],
        value: AimObject,
        strict: bool = True
    ):
        if path == Ellipsis:
            path = ()
        if not isinstance(path, (tuple, list)):
            path = (path,)

        batch = self.container.batch()
        encoded_path = E.encode_path(path)
        self.container.delete_range(encoded_path, encoded_path + b'\xff',
                                    store_batch=batch)
        for key, val in treeutils.encode_tree(value, strict=strict):
            self.container.set(encoded_path + key, val,
                               store_batch=batch)
        self.container.commit(batch)

    def keys_eager(
            self,
            path: Union[AimObjectKey, AimObjectPath] = (),
    ) -> List[Union[AimObjectPath, AimObjectKey]]:
        return list(self.subtree(path).keys())

    def keys(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        level: int = None
    ) -> Iterator[Union[AimObjectPath, AimObjectKey]]:
        encoded_path = E.encode_path(path)
        walker = self.container.walk(encoded_path)
        path = None
        while True:
            try:
                if path is None:
                    path = next(walker)
                else:
                    path = walker.send(path)
            except StopIteration:
                return
            path = E.decode_path(path)
            path = path[:(1 if level is None else level)]
            if level is None:
                yield path[0]
            else:
                yield path
            p = E.encode_path(path)
            assert p.endswith(b'\xfe')
            path = p[:-1] + b'\xff'

    def items_eager(
            self,
            path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> List[Tuple[
        AimObjectKey,
        AimObject
    ]]:
        return list(self.subtree(path).items())

    def items(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> Iterator[Tuple[
        AimObjectKey,
        AimObject
    ]]:
        prefix = E.encode_path(path)
        it = self.container.view(prefix).items()
        for path, value in treeutils.iter_decode_tree(it, level=1):
            key, = path
            yield key, value

    def iterlevel(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        level: int = 1
    ) -> Iterator[Tuple[
        AimObjectPath,
        AimObject
    ]]:
        prefix = E.encode_path(path)
        it = self.container.items(prefix)
        for path, value in treeutils.iter_decode_tree(it, level=level):
            yield path, value

    def array(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        dtype: Any = None
    ) -> TreeArrayView:
        return TreeArrayView(self.subtree(path), dtype=dtype)

    def first(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> Tuple[AimObjectKey, AimObject]:
        if isinstance(path, (int, str)):
            path = (path,)
        prefix = E.encode_path(path)
        p = E.decode_path(self.container.view(prefix).next_key())
        return p[0]

    def last(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> Tuple[AimObjectKey, AimObject]:
        if isinstance(path, (int, str)):
            path = (path,)
        prefix = E.encode_path(path)
        # assert prefix.endswith(b'\xfe')
        # prefix = prefix[:-1] + b'\xff'
        p = E.decode_path(self.container.view(prefix).prev_key())
        if not p:
            raise KeyError
        return p[0]
