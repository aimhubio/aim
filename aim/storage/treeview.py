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
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> AimObject:
        prefix = E.encode_path(path)
        it = self.container.items(prefix)
        return treeutils.decode_tree(it)

    def __getitem__(
        self,
        path: Union[AimObjectKey, AimObjectPath]
    ) -> AimObject:
        if path == Ellipsis:
            path = ()
        if not isinstance(path, (tuple, list)):
            path = [path]
        return self.collect(path)

    def get(
        self,
        path: Union[AimObjectKey, AimObjectPath]
    ) -> AimObject:
        try:
            return self.__getitem__(path)
        except KeyError as e:
            return None

    def __delitem__(
        self,
        path: Union[AimObjectKey, AimObjectPath]
    ):
        if path == Ellipsis:
            path = ()
        if not isinstance(path, (tuple, list)):
            path = [path]
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
            path = [path]
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
    ) -> Iterator[Tuple[
        AimObjectPath,
        AimObject
    ]]:
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

    # def numpy(
    #     self,
    #     path: Union[AimObjectKey, AimObjectPath] = (),
    #     *,
    #     dtype=None
    # ) -> np.ndarray:
    #     # TODO URGENT implement using cython
    #     val = self.collect(path)
    #     assert isinstance(val, list)
    #     return np.array(val, dtype=dtype)

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
