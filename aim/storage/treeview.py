from aim.storage.types import AimObject, AimObjectKey, AimObjectPath
from aim.storage.container import Container
from aim.storage.arrayview import TreeArrayView

from typing import Any, Dict, Iterator, Tuple, Union


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

    def view(
        self,
        path: Union[AimObjectKey, AimObjectPath]
    ) -> 'TreeView':
        ...

    def make_array(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ):
        ...

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
        ...

    def get(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        default: Any = None
    ) -> AimObject:
        ...

    def __delitem__(
        self,
        path: Union[AimObjectKey, AimObjectPath]
    ):
        ...

    def __setitem__(
        self,
        path: Union[AimObjectKey, AimObjectPath],
        value: AimObject
    ):
        ...

    def keys(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        level: int = None
    ) -> Iterator[Union[AimObjectPath, AimObjectKey]]:
        ...

    def items(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> Iterator[Tuple[
        AimObjectKey,
        AimObject
    ]]:
        ...

    def iterlevel(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        level: int = 1
    ) -> Iterator[Tuple[
        AimObjectPath,
        AimObject
    ]]:
        ...

    def array(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> TreeArrayView:
        ...

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
