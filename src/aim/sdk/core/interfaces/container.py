from abc import abstractmethod
from typing import Iterable, Iterator, TypeVar, List, Any

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from aim.sdk.core.interfaces.sequence import SequenceCollection


class Container(object):
    @abstractmethod
    def __setitem__(self, key, value):
        ...

    @abstractmethod
    def __getitem__(self, key):
        ...

    @abstractmethod
    def __delitem__(self, key):
        ...

    @abstractmethod
    def get(self, key, default: Any = None, strict: bool = False):
        ...

    @property
    @abstractmethod
    def sequences(self) -> 'SequenceCollection':
        ...

    @abstractmethod
    def match(self, expr) -> bool:
        ...


ContainerType = TypeVar('ContainerType', bound=Container)


class ContainerCollection(Iterable[ContainerType]):
    @abstractmethod
    def __iter__(self) -> Iterator[ContainerType]:
        ...

    @abstractmethod
    def filter(self, expr: str) -> 'ContainerCollection[ContainerType]':
        ...

    @abstractmethod
    def limit(self, n) -> 'ContainerCollection[ContainerType]':
        ...

    def all(self) -> List[ContainerType]:
        return list(iter(self))

    def first(self) -> ContainerType:
        return next(iter(self))
