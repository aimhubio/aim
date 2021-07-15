from abc import abstractmethod
from typing import Iterable, Iterator, Tuple

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .treeview import TreeView
    from .repo import Repo


class ContainerView:

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
        self,
        prefix: bytes = b''
    ) -> 'TreeView':
        ...

    @abstractmethod
    def walk(
        self,
        prefix: bytes = b''
    ):
        ...
