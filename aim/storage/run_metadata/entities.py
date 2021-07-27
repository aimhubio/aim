from abc import abstractmethod
from typing import Generic, TypeVar, Iterable, Optional


class SafeNone:
    def __getattr__(self, item):
        return self

    def __getitem__(self, item):
        return self

    def __bool__(self):
        return False

    def __eq__(self, other):
        return other is None or isinstance(other, SafeNone)


T = TypeVar('T')

RunCollection = Iterable['Run']
ExperimentCollection = Iterable['Experiment']
TagCollection = Iterable['Tag']


class Searchable(Generic[T]):
    @classmethod
    @abstractmethod
    def find(cls, _id: str, **kwargs) -> Optional[T]:
        ...

    @classmethod
    @abstractmethod
    def all(cls, **kwargs) -> Iterable[T]:
        ...

    @classmethod
    @abstractmethod
    def search(cls, term: str, **kwargs) -> Iterable[T]:
        ...


class Run(Searchable['Run']):
    @property
    @abstractmethod
    def hash(self) -> str:
        ...

    @property
    @abstractmethod
    def name(self) -> Optional[str]:
        ...

    @name.setter
    @abstractmethod
    def name(self, value: str):
        ...

    @property
    @abstractmethod
    def description(self) -> Optional[str]:
        ...

    @description.setter
    @abstractmethod
    def description(self, value: str):
        ...

    @property
    @abstractmethod
    def archived(self) -> bool:
        ...

    @archived.setter
    @abstractmethod
    def archived(self, value: bool):
        ...

    @property
    @abstractmethod
    def experiment(self) -> Optional['Experiment']:
        ...

    @experiment.setter
    @abstractmethod
    def experiment(self, value: str):
        ...

    @property
    @abstractmethod
    def tags(self) -> TagCollection:
        ...

    @abstractmethod
    def add_tag(self, value: str) -> 'Tag':
        ...

    @abstractmethod
    def remove_tag(self, tag_id: str) -> bool:
        ...


class Experiment(Searchable['Experiment']):
    @property
    @abstractmethod
    def uuid(self) -> str:
        ...

    @property
    @abstractmethod
    def name(self) -> str:
        ...

    @name.setter
    @abstractmethod
    def name(self, value: str):
        ...

    @property
    def runs(self) -> RunCollection:
        ...


class Tag(Searchable['Tag']):
    @property
    @abstractmethod
    def uuid(self) -> str:
        ...

    @property
    @abstractmethod
    def name(self) -> str:
        ...

    @name.setter
    @abstractmethod
    def name(self, value: str):
        ...

    @property
    @abstractmethod
    def color(self) -> str:
        ...

    @color.setter
    @abstractmethod
    def color(self, value: str):
        ...

    @property
    @abstractmethod
    def runs(self) -> RunCollection:
        ...


class ObjectFactory:
    @abstractmethod
    def runs(self) -> RunCollection:
        ...

    @abstractmethod
    def search_runs(self, term: str) -> RunCollection:
        ...

    @abstractmethod
    def find_run(self, _id: str) -> Run:
        ...

    @abstractmethod
    def experiments(self) -> ExperimentCollection:
        ...

    @abstractmethod
    def search_experiments(self, term: str) -> ExperimentCollection:
        ...

    @abstractmethod
    def find_experiment(self, _id: str) -> Experiment:
        ...

    @abstractmethod
    def create_experiment(self, name: str) -> Experiment:
        ...

    @abstractmethod
    def tags(self) -> TagCollection:
        ...

    @abstractmethod
    def search_tags(self, term: str) -> TagCollection:
        ...

    @abstractmethod
    def find_tag(self, _id: str) -> Tag:
        ...

    @abstractmethod
    def create_tag(self, name: str) -> Tag:
        ...
