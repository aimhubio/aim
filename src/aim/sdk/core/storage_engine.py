import contextlib
from abc import abstractmethod

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from aim.core.storage.treeview import TreeView
    from aim.core.storage.locking import ContainerLock
    from aim.sdk.reporter import RunStatusReporter


class StorageEngine(object):
    @property
    @abstractmethod
    def url(self) -> str:
        ...

    @abstractmethod
    def tree(self, hash_: str, name: str, read_only: bool) -> 'TreeView':
        ...

    @abstractmethod
    def lock(self, hash_: str, timeout: int) -> 'ContainerLock':
        ...

    @abstractmethod
    def status_reporter(self, hash_: str) -> 'RunStatusReporter':
        ...

    @abstractmethod
    def task_queue(self, hash_: str):
        ...

    @abstractmethod
    @contextlib.contextmanager
    def write_batch(self, hash_: str):
        ...

    @abstractmethod
    def remove_queue(self, hash_: str):
        ...
