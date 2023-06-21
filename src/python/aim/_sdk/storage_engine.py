import contextlib
from abc import abstractmethod

from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from aim._core.storage.treeview import TreeView
    from aim._core.storage.locking import ContainerLock
    from aimcore.reporter import RunStatusReporter


class StorageEngine(object):
    @property
    @abstractmethod
    def url(self) -> str:
        ...

    @abstractmethod
    def tree(self, hash_: Optional[str], name: str, read_only: bool) -> 'TreeView':
        ...

    @abstractmethod
    def lock(self, hash_: str, timeout: int = 10) -> 'ContainerLock':
        ...

    @abstractmethod
    def status_reporter(self, hash_: str) -> 'RunStatusReporter':
        ...

    @abstractmethod
    def task_queue(self):
        ...

    @abstractmethod
    @contextlib.contextmanager
    def write_batch(self, hash_: str):
        ...

    @abstractmethod
    def dev_package(self, name):
        ...
