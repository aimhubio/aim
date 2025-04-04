from abc import ABC, abstractmethod
from typing import Collection, Generic, List, Optional, TypeVar


T = TypeVar('T')

RunCollection = Collection['Run']
ExperimentCollection = Collection['Experiment']
TagCollection = Collection['Tag']
NoteCollection = Collection['Note']


class StructuredObject(ABC):
    @classmethod
    @abstractmethod
    def fields(cls):
        ...


class Searchable(ABC, Generic[T]):
    @classmethod
    @abstractmethod
    def find(cls, _id: str, **kwargs) -> Optional[T]:
        ...

    @classmethod
    @abstractmethod
    def all(cls, **kwargs) -> Collection[T]:
        ...

    @classmethod
    @abstractmethod
    def search(cls, term: str, **kwargs) -> Collection[T]:
        ...


class Run(StructuredObject, Searchable['Run']):
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
    def remove_tag(self, tag_name: str) -> bool:
        ...

    @property
    @abstractmethod
    def info(self) -> 'RunInfo':
        ...


class Experiment(StructuredObject, Searchable['Experiment']):
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
    def runs(self) -> RunCollection:
        ...


class Tag(StructuredObject, Searchable['Tag']):
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
    def description(self) -> str:
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
    def runs(self) -> RunCollection:
        ...


class Note(StructuredObject, Searchable['Note']):
    @property
    @abstractmethod
    def id(self) -> int:
        ...

    @property
    @abstractmethod
    def content(self) -> str:
        ...

    @content.setter
    @abstractmethod
    def content(self, value: str):
        ...

    @property
    @abstractmethod
    def run(self) -> int:
        ...


class RunInfo(StructuredObject, Generic[T]):
    @property
    @abstractmethod
    def last_notification_index(self) -> int:
        ...

    @last_notification_index.setter
    @abstractmethod
    def last_notification_index(self, value: int):
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
    def find_runs(self, ids: List[str]) -> List[Run]:
        ...

    @abstractmethod
    def create_run(self, runhash: str) -> Run:
        ...

    @abstractmethod
    def delete_run(self, runhash: str) -> bool:
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
    def delete_experiment(self, _id: str) -> bool:
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

    @abstractmethod
    def delete_tag(self, name: str) -> bool:
        ...
