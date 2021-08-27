import numpy as np

from typing import Any, Generic, Iterator, List, TYPE_CHECKING, Tuple, TypeVar, Union
if TYPE_CHECKING:
    from .treeview import TreeView


T = TypeVar("T")


class ArrayView(Generic[T]):

    def __iter__(self) -> Iterator[T]:
        ...

    def keys(self) -> Iterator[int]:
        ...

    def indices(self) -> Iterator[int]:
        ...

    def values(self) -> Iterator[T]:
        ...

    def items(self) -> Iterator[Tuple[int, T]]:
        ...

    def __len__(self) -> int:
        ...

    def __getitem__(
        self,
        idx: Union[int, slice]
    ) -> T:
        ...

    # TODO implement append

    def __setitem__(
        self,
        idx: int,
        val: Any
    ):
        ...

    def sparse_list(self) -> Tuple[List[int], List[T]]:
        ...

    def indices_list(self) -> List[int]:
        ...

    def values_list(self) -> List[T]:
        ...

    def sparse_numpy(self) -> Tuple[np.ndarray, np.ndarray]:
        ...

    def indices_numpy(self) -> np.ndarray:
        ...

    def values_numpy(self) -> np.ndarray:
        ...

    def tolist(self) -> List[T]:
        ...

    def first(self) -> Tuple[int, T]:
        ...

    def first_idx(self) -> int:
        ...

    def first_value(self) -> T:
        ...

    def last(self) -> Tuple[int, T]:
        ...

    def last_idx(self) -> int:
        ...

    def last_value(self) -> T:
        ...

    def min_idx(self) -> int:
        ...

    def max_idx(self) -> int:
        ...


class ContainerArrayView(ArrayView[T]):
    def __init__(
        self,
        tree: 'TreeView',
        dtype: Any = None
    ):
        self.tree = tree
        self.dtype = dtype

    def allocate(self):
        self.tree.make_array()
        return self

    def __iter__(self) -> Iterator[T]:
        yield from self.values()

    def keys(self) -> Iterator[int]:
        yield from self.tree.keys()

    def indices(self) -> Iterator[int]:
        yield from self.keys()

    def values(self) -> Iterator[T]:
        for k, v in self.tree.items():
            yield v

    def items(self) -> Iterator[Tuple[int, T]]:
        yield from self.tree.items()

    def __len__(self) -> int:
        # TODO lazier
        try:
            last_idx = self.last_idx()
        except KeyError:
            return 0
        return last_idx + 1

    def __bool__(self) -> bool:
        return bool(len(self))

    def __getitem__(
        self,
        idx: Union[int, slice]
    ) -> T:
        if isinstance(idx, slice):
            raise NotImplementedError
        return self.tree[idx]

    # TODO implement append

    def __setitem__(
        self,
        idx: int,
        val: Any
    ):
        assert isinstance(idx, int)
        self.tree[idx] = val

    def sparse_list(self) -> Tuple[List[int], List[T]]:
        indices = []
        values = []
        for k, v in self.items():
            indices.append(k)
            values.append(v)

        return indices, values

    def indices_list(self) -> List[int]:
        return list(self.indices())

    def values_list(self) -> List[T]:
        return list(self.values())

    def sparse_numpy(self) -> Tuple[np.ndarray, np.ndarray]:
        # TODO URGENT implement using cython
        indices_list, values_list = self.sparse_list()
        indices_array = np.array(indices_list, dtype=np.intp)
        values_array = np.array(values_list, dtype=self.dtype)
        return indices_array, values_array

    def indices_numpy(self) -> np.ndarray:
        # TODO URGENT implement using cython
        return np.array(self.indices_list(), dtype=np.intp)

    def values_numpy(self) -> np.ndarray:
        # TODO URGENT implement using cython
        return np.array(self.values_list(), dtype=self.dtype)

    def tolist(self) -> List[T]:
        arr = self.tree[...]
        assert isinstance(arr, list)
        return arr

    def first(self) -> Tuple[int, T]:
        idx = self.min_idx()
        return idx, self[idx]

    def first_idx(self) -> int:
        return self.min_idx()

    def first_value(self) -> T:
        return self[self.min_idx()]

    def last(self) -> Tuple[int, T]:
        idx = self.max_idx()
        return idx, self[idx]

    def last_idx(self) -> int:
        return self.max_idx()

    def last_value(self) -> T:
        return self[self.max_idx()]

    def min_idx(self) -> int:
        return self.tree.first()

    def max_idx(self) -> int:
        return self.tree.last()
