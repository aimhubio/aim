from abc import abstractmethod

from aim.storage.types import AimObject, AimObjectKey, AimObjectPath

from typing import TYPE_CHECKING, Any, Iterator, Tuple, Union

if TYPE_CHECKING:
    from aim.storage.arrayview import ArrayView
    from aim.storage.container import Container


class TreeView:

    def preload(
        self
    ):
        ...

    def finalize(
        self,
        *,
        index: 'Container'
    ):
        ...

    def subtree(self, path: Union[AimObjectKey, AimObjectPath]) -> 'TreeView':
        # Default to:
        return self.view(path, resolve=False)

    @abstractmethod
    def view(
        self,
        path: Union[AimObjectKey, AimObjectPath],
        resolve: bool = False
    ):
        ...

    @abstractmethod
    def make_array(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ):
        ...

    @abstractmethod
    def collect(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        strict: bool = True
    ) -> AimObject:
        ...

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
            return self[path]
        except KeyError:
            return default

    @abstractmethod
    def __delitem__(
        self,
        path: Union[AimObjectKey, AimObjectPath]
    ):
        ...

    @abstractmethod
    def __setitem__(
        self,
        path: Union[AimObjectKey, AimObjectPath],
        value: AimObject
    ):
        ...

    @abstractmethod
    def keys(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        level: int = None
    ) -> Iterator[Union[AimObjectPath, AimObjectKey]]:
        ...

    @abstractmethod
    def items(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> Iterator[Tuple[
        AimObjectKey,
        AimObject
    ]]:
        ...

    @abstractmethod
    def iterlevel(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        level: int = 1
    ) -> Iterator[Tuple[
        AimObjectPath,
        AimObject
    ]]:
        ...

    @abstractmethod
    def array(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> 'ArrayView':
        ...

    @abstractmethod
    def first(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> Tuple[AimObjectKey, AimObject]:
        ...

    @abstractmethod
    def last(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> Tuple[AimObjectKey, AimObject]:
        ...
