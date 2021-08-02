from abc import abstractmethod
from typing import Iterable, Iterator, Tuple

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .treeview import TreeView
    from .repo import Repo


class ContainerView:

    def preload(self):
        ...

    @property
    def repo(
        self
    ) -> 'Repo':
        ...

    @classmethod
    def path_join(
        self,
        *args: Iterable[bytes],
        prefix: bytes = b''
    ) -> bytes:
        return prefix + b'.'.join(args)

    @abstractmethod
    def __setitem__(
        self,
        key: bytes,
        value: bytes
    ) -> bytes:
        ...

    @abstractmethod
    def __getitem__(
        self,
        key: bytes
    ) -> bytes:
        ...

    @abstractmethod
    def __delitem__(
        self,
        key: bytes
    ) -> None:
        ...

    @abstractmethod
    def items(
        self,
        prefix: bytes = None
    ) -> Iterator[Tuple[bytes, bytes]]:
        ...

    @abstractmethod
    def iterlevel(
        self,
        prefix: bytes = None
    ) -> Iterator[Tuple[bytes, bytes]]:
        ...

    @abstractmethod
    def keys(
        self,
        prefix: bytes = None
    ):
        ...

    @abstractmethod
    def values(
        self,
        prefix: bytes
    ):
        ...

    @abstractmethod
    def view(
        self,
        prefix: bytes = b''
    ) -> 'ContainerView':
        ...

    @abstractmethod
    def tree(
        self
    ) -> 'TreeView':
        ...

    @abstractmethod
    def walk(
        self,
        prefix: bytes = b''
    ):
        ...

    @abstractmethod
    def next_key(
        self,
        key: bytes = b''
    ) -> bytes:
        ...

    @abstractmethod
    def next_value(
        self,
        key: bytes = b''
    ) -> bytes:
        ...

    @abstractmethod
    def next_key_value(
        self,
        key: bytes = b''
    ) -> Tuple[bytes, bytes]:
        ...

    @abstractmethod
    def prev_key(
        self,
        key: bytes = b''
    ) -> bytes:
        ...

    @abstractmethod
    def prev_value(
        self,
        key: bytes = b''
    ) -> bytes:
        ...

    @abstractmethod
    def prev_key_value(
        self,
        key: bytes = b''
    ) -> Tuple[bytes, bytes]:
        ...

    @abstractmethod
    def batch_delete(
        self,
        prefix: bytes,
        store_batch = None
    ):
        ...

    @abstractmethod
    def batch_set(
        self,
        key: bytes,
        value: bytes,
        *,
        store_batch = None
    ):
        ...
