from abc import ABC, abstractmethod


class Base(ABC):
    @abstractmethod
    def commit(self):
        ...

    @abstractmethod
    def checkout(self):
        ...

    @abstractmethod
    def get_diff(self):
        ...
