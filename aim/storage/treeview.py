import numpy as np

import aimrocks

from aim.storage import encoding as E
from aim.storage.types import AimObject, AimObjectKey, AimObjectPath
from aim.storage.utils import ArrayFlag, ObjectFlag
from aim.storage.containerview import ContainerView
from aim.storage import treeutils
from aim.storage.arrayview import ContainerArrayView

from typing import Any, Iterable, Iterator, MutableMapping, Tuple, Type, Union


class TreeView:  # TODO implement (MutableMapping):
    def __init__(
        self,
        container: ContainerView
    ) -> None:
        self.container = container

    def preload(
        self
    ):
        self.container.preload()

    def view(
        self,
        path: Union[AimObjectKey, AimObjectPath]
    ) -> 'TreeView':
        prefix = E.encode_path(path)

        container_view = self.container.view(prefix)
        return TreeView(container_view)

    def make_array(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ):
        prefix = E.encode_path(path)
        self.container[prefix] = E.encode(ArrayFlag)

    def collect(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        strict: bool = True
    ) -> AimObject:
        if path == Ellipsis:
            path = ()
        if isinstance(path, (int, str)):
            path = (path,)
        prefix = E.encode_path(path)
        it = self.container.items(prefix)
        return treeutils.decode_tree(it, strict=strict)

    def __getitem__(
        self,
        path: Union[AimObjectKey, AimObjectPath]
    ) -> AimObject:
        return self.collect(path)

    def get(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        default: Any = None
    ) -> AimObject:
        try:
            return self.__getitem__(path)
        except KeyError as e:
            return default

    def __delitem__(
        self,
        path: Union[AimObjectKey, AimObjectPath]
    ):
        if path == Ellipsis:
            path = ()
        if not isinstance(path, (tuple, list)):
            path = (path,)
        encoded_path = E.encode_path(path)
        return self.container.batch_delete(encoded_path)

    def __setitem__(
        self,
        path: Union[AimObjectKey, AimObjectPath],
        value: AimObject
    ):
        if path == Ellipsis:
            path = ()
        if not isinstance(path, (tuple, list)):
            path = (path,)
        # move rocksdb to lower layers
        batch = aimrocks.WriteBatch()
        encoded_path = E.encode_path(path)
        # TODO implement read-modify or in cython, low-level
        self.container.batch_delete(encoded_path, batch)
        for key, val in treeutils.encode_tree(value):
            self.container.batch_set(encoded_path + key, val, store_batch=batch)
        self.container.commit(batch)

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

    def items(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> Iterator[Tuple[
        AimObjectKey,
        AimObject
    ]]:
        prefix = E.encode_path(path)
        it = self.container.items(prefix)
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
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> ContainerArrayView:
        return ContainerArrayView(self.view(path))

    def first(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> Tuple[AimObjectKey, AimObject]:
        if isinstance(path, (int, str)):
            path = (path,)
        prefix = E.encode_path(path)
        p = E.decode_path(self.container.next_key(prefix))
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
        p = E.decode_path(self.container.prev_key(prefix))
        if not p:
            raise KeyError
        return p[0]

    # __iter__
    # __len__
    # __contains__
    # keys
    # items
    # values
    # get
    # __eq__
    # __ne__
    # __setitem__
    # __delitem__
    # __iter__
    # __len__
    # pop
    # popitem
    # clear
    # update
    # and setdefault
