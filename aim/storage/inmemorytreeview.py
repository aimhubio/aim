from copy import deepcopy

from aim.storage.types import CustomObjectBase
from aim.storage.types import AimObject, AimObjectKey, AimObjectPath
from aim.storage.treearrayview import TreeArrayView
from aim.storage.treeview import TreeView

from typing import Any, Iterator, Tuple, Union


class InMemoryTreeView(TreeView):
    def __init__(
        self,
        container: AimObject,
        constructed: bool = True
    ) -> None:
        self._constructed = constructed
        self.container = container

    def view(
        self,
        path: Union[AimObjectKey, AimObjectPath],
        resolve: bool = False
    ):
        if isinstance(path, (int, str)):
            path = (path,)
        assert path

        container = self.container
        for key in path:
            container = container[key]

        if isinstance(container, CustomObjectBase):
            return container

        return InMemoryTreeView(container)

    def make_array(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ):
        if isinstance(path, (int, str)):
            path = (path,)
        assert path

        *path, last_key = path
        container = self.container
        for key in path:
            container = container[key]

        container[last_key] = []

    def collect(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        strict: bool = True,
        resolve_objects: bool = False
    ) -> AimObject:
        if not strict:
            raise NotImplementedError("Non-strict mode is not supported yet.")

        if path == Ellipsis:
            path = ()

        if isinstance(path, (int, str)):
            path = (path,)

        container = self.container
        for key in path:
            container = container[key]

        return deepcopy(container)

    def __delitem__(
        self,
        path: Union[AimObjectKey, AimObjectPath]
    ):
        if isinstance(path, (int, str)):
            path = (path,)
        assert path

        *path, last_key = path
        container = self.container
        for key in path:
            container = container[key]

        del container[last_key]

    def __setitem__(
        self,
        path: Union[AimObjectKey, AimObjectPath],
        value: AimObject
    ):
        if path == Ellipsis:
            path = ()

        if isinstance(path, (int, str)):
            path = (path,)
        assert path

        *path, last_key = path
        container = self.container
        for key in path:
            container = container[key]

        container[last_key] = deepcopy(value) if self._constructed else value

    def keys_eager(
            self,
            path: Union[AimObjectKey, AimObjectPath] = (),
    ):
        return list(self.subtree(path).keys())

    def keys(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        level: int = 0
    ) -> Iterator[Union[AimObjectPath, AimObjectKey]]:
        if level > 0:
            raise NotImplementedError("Level iteration not supported yet.")
        container = self.container
        for key in path:
            container = container[key]
        for key in container.keys():
            yield key

    def items_eager(
            self,
            path: Union[AimObjectKey, AimObjectPath] = ()
    ):
        return list(self.subtree(path).items())

    def items(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> Iterator[Tuple[
        AimObjectKey,
        AimObject
    ]]:
        container = self.container
        for key in path:
            container = container[key]
        for key, value in container.items():
            yield key, deepcopy(value)

    def iterlevel(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        level: int = 1
    ) -> Iterator[Tuple[
        AimObjectPath,
        AimObject
    ]]:
        raise NotImplementedError("Level iteration not supported yet.")

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
        ...

    def last_key(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> AimObjectKey:
        ...
