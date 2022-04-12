from aim.storage.types import AimObject, AimObjectKey, AimObjectPath

from typing import TYPE_CHECKING, Any, Iterator, Tuple, Union, List

if TYPE_CHECKING:
    from aim.storage.arrayview import ArrayView


class TreeView:

    def preload(
        self
    ):
        ...

    def finalize(
        self,
        index: 'TreeView'
    ):
        ...

    def subtree(self, path: Union[AimObjectKey, AimObjectPath]) -> 'TreeView':
        # Default to:
        return self.view(path, resolve=False)

    def view(
        self,
        path: Union[AimObjectKey, AimObjectPath],
        resolve: bool = False
    ):
        ...

    def make_array(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ):
        ...

    def collect(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        strict: bool = True,
        resolve_objects: bool = False
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

    def __delitem__(
        self,
        path: Union[AimObjectKey, AimObjectPath]
    ):
        ...

    def set(
        self,
        path: Union[AimObjectKey, AimObjectPath],
        value: AimObject,
        strict: bool = True
    ):
        self.__setitem__(path, value)

    def __setitem__(
        self,
        path: Union[AimObjectKey, AimObjectPath],
        value: AimObject
    ):
        self.set(path, value, strict=True)

    # TODO [MV]: revisit this approach after cython bindings refactoring
    def keys_eager(
            self,
            path: Union[AimObjectKey, AimObjectPath] = (),
    ) -> List[Union[AimObjectPath, AimObjectKey]]:
        ...

    def keys(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        level: int = None
    ) -> Iterator[Union[AimObjectPath, AimObjectKey]]:
        ...

    def items_eager(
            self,
            path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> List[Tuple[
        AimObjectKey,
        AimObject
    ]]:
        ...

    def items(
        self,
        path: Union[AimObjectKey, AimObjectPath] = ()
    ) -> Iterator[Tuple[
        AimObjectKey,
        AimObject
    ]]:
        ...

    def array(
        self,
        path: Union[AimObjectKey, AimObjectPath] = (),
        dtype: Any = None
    ) -> 'ArrayView':
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
