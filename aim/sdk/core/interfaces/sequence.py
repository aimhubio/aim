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
    def item_type(self) -> str:
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
    def axis_names(self) -> List[str]:
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

    def values(self) -> Iterator[Any]:
        # default implementation
        for _, v in self.items():
            yield v

    def steps(self) -> Iterator[int]:
        # default implementation
        for k, _ in self.items():
            yield k


SeqType = TypeVar('SeqType', bound=Sequence)


class SequenceCollection(Iterable[SeqType]):
    @abstractmethod
    def __iter__(self) -> Iterator[SeqType]:
        ...

    @abstractmethod
    def filter(self, expr: str) -> 'SequenceCollection[SeqType]':
        ...

    @abstractmethod
    def limit(self, n: int) -> 'SequenceCollection[SeqType]':
        ...

    def all(self) -> List[SeqType]:
        return list(iter(self))

    def first(self) -> SeqType:
        return next(iter(self))


class SequenceMap(Iterable[SeqType]):
    @abstractmethod
    def __iter__(self) -> Iterator[SeqType]:
        ...

    @abstractmethod
    def __getitem__(self, item: Union[str, Tuple[str, Dict]]) -> SeqType:
        ...

    @abstractmethod
    def __delitem__(self, item: Union[str, Tuple[str, Dict]]):
        ...
