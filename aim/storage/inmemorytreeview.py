from copy import deepcopy

from aim.storage.types import CustomObjectBase
from aim.storage.types import AimObject, AimObjectKey, AimObjectPath
from aim.storage.container import Container
from aim.storage.arrayview import TreeArrayView
from aim.storage.treeview import TreeView

from typing import Any, Dict, Iterator, Tuple, Union


class InMemoryTreeView(TreeView):
    def __init__(
        self,
        container
    ) -> None:
        self.container = container

    def preload(
        self
    ):
        pass

    def finalize(
        self,
        *,
        index: 'Container'
    ):
        pass

    def view(
        self,
        path: Union[AimObjectKey, AimObjectPath]
    ) -> 'InMemoryTreeView':
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
        path: Union[AimObjectKey, AimObjectPath]
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
        strict: bool = True
    ) -> AimObject:
        assert strict

        if path == Ellipsis:
            path = ()

        if isinstance(path, (int, str)):
            path = (path,)

        container = self.container
        for key in path:
            container = container[key]

        return deepcopy(container)

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
        except KeyError:
            return default

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
        if isinstance(path, (int, str)):
            path = (path,)
        assert path

        *path, last_key = path
        container = self.container
        for key in path:
            container = container[key]

        container[last_key] = deepcopy(value)

    def keys(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        level: int = None
    ) -> Iterator[Union[AimObjectPath, AimObjectKey]]:
        if level is not None:
            raise NotImplementedError()
        container = self.container
        for key in path:
            container = container[key]
        for key in container.keys():
            yield key

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
        raise NotImplementedError()

    def array(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> TreeArrayView:
        return TreeArrayView(self.view(path, resolve=False))

    def first(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> Tuple[AimObjectKey, AimObject]:
        ...

    def last(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> Tuple[AimObjectKey, AimObject]:
        ...
