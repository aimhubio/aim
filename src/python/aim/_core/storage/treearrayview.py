import numpy as np

from typing import Any, Iterator, List, Tuple, Union
from aim._core.storage.treeview import TreeView
from aim._core.storage.arrayview import ArrayView


class TreeArrayView(ArrayView):
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

    def __iter__(self) -> Iterator[Any]:
        yield from self.values()

    def keys(self) -> Iterator[int]:
        yield from self.tree.keys()

    def indices(self) -> Iterator[int]:
        yield from self.keys()

    def values(self) -> Iterator[Any]:
        for k, v in self.tree.items():
            yield v

    def items(self) -> Iterator[Tuple[int, Any]]:
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
    ) -> Any:
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

    def sparse_list(self) -> Tuple[List[int], List[Any]]:
        indices = []
        values = []
        for k, v in self.items():
            indices.append(k)
            values.append(v)

        return indices, values

    def indices_list(self) -> List[int]:
        return list(self.indices())

    def values_list(self) -> List[Any]:
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

    def tolist(self) -> List[Any]:
        arr = self.tree[...]
        assert isinstance(arr, list)
        return arr

    def first(self) -> Tuple[int, Any]:
        idx = self.first_idx()
        return idx, self[idx]

    def first_idx(self) -> int:
        return self.tree.first_key()

    def first_value(self) -> Any:
        return self[self.first_idx()]

    def last(self) -> Tuple[int, Any]:
        idx = self.last_idx()
        return idx, self[idx]

    def last_idx(self) -> int:
        return self.tree.last_key()

    def last_value(self) -> Any:
        return self[self.last_idx()]
