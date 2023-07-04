from abc import abstractmethod
from typing import Dict, Tuple, List, Iterator, Iterable, Any, Optional, Union, TypeVar


class Sequence(object):
    @property
    @abstractmethod
    def name(self) -> str:
        ...

    @property
    @abstractmethod
    def context(self) -> Dict:
        ...

    @property
    @abstractmethod
    def type(self) -> str:
        ...

    @property
    @abstractmethod
    def is_empty(self) -> bool:
        ...

    def __bool__(self) -> bool:
        return not self.is_empty

    @abstractmethod
    def match(self, expr) -> bool:
        ...

    @property
    @abstractmethod
    def axis_names(self) -> Tuple[str]:
        ...

    @abstractmethod
    def allowed_value_types(self) -> Tuple[str, ...]:
        ...

    @abstractmethod
    def track(self, value: Any, *, step: Optional[int] = None, **axis):
        ...

    @abstractmethod
    def __iter__(self) -> Iterator[Tuple[int, Tuple[Any, ...]]]:
        ...

    @abstractmethod
    def items(self) -> Iterator[Tuple[int, Any]]:
        ...

    @abstractmethod
    def axis(self, name: str) -> Iterator[Any]:
        ...

    @abstractmethod
    def values(self) -> Iterator[Any]:
        ...

    def steps(self) -> Iterator[int]:
        # default implementation
        for k, _ in self.items():
            yield k


SequenceType = TypeVar('SequenceType', bound=Sequence)


class SequenceCollection(Iterable[SequenceType]):
    @abstractmethod
    def __iter__(self) -> Iterator[SequenceType]:
        ...

    @abstractmethod
    def filter(self, expr: str) -> 'SequenceCollection[SequenceType]':
        ...

    @abstractmethod
    def limit(self, n: int) -> 'SequenceCollection[SequenceType]':
        ...

    def all(self) -> List[SequenceType]:
        return list(iter(self))

    def first(self) -> SequenceType:
        return next(iter(self))

    def count(self) -> int:
        # default implementation
        return sum(1 for _ in iter(self))


class SequenceMap(Iterable[SequenceType]):
    @abstractmethod
    def __iter__(self) -> Iterator[SequenceType]:
        ...

    @abstractmethod
    def __getitem__(self, item: Union[str, Tuple[str, Dict]]) -> SequenceType:
        ...

    @abstractmethod
    def __delitem__(self, item: Union[str, Tuple[str, Dict]]):
        ...
