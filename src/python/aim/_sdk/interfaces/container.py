from abc import abstractmethod
from typing import Iterable, Iterator, TypeVar, List, Any, Optional

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .sequence import SequenceCollection


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

    @abstractmethod
    def set(self, key, value: Any, strict: bool):
        ...

    @property
    @abstractmethod
    def sequences(self) -> 'SequenceCollection':
        ...

    @abstractmethod
    def match(self, expr) -> bool:
        ...

    def track(self, value, name: str, step: Optional[int] = None, context: dict = Optional[None], **axis):
        raise NotImplementedError


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

    def count(self) -> int:
        # default implementation
        return sum(1 for _ in iter(self))
