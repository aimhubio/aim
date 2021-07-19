import numpy as np

from typing import Any, Generic, Iterator, List, TYPE_CHECKING, Tuple, TypeVar, Union
if  TYPE_CHECKING:
    from .treeview import TreeView


T = TypeVar("T")


class ArrayView(Generic[T]):
    pass


class ContainerArrayView(ArrayView):
    def __init__(
        self,
        tree: 'TreeView',
        dtype: Any = None,
        _slice: slice = None
    ):
        self.tree = tree
        self.dtype = dtype
        self._slice = _slice

    def allocate(self):
        self.tree.make_array()
        return self

    def __iter__(self) -> Iterator[T]:
        if self._slice is not None:
            raise NotImplementedError

        for k, v in self.tree.items():
            yield v

    def __len__(self) -> int:
        # TODO lazier
        return len(self.tolist())

    def __getitem__(
        self,
        idx: Union[int, slice]
    ) -> T:
        if isinstance(idx, int):
            return self.tree[idx]
        elif isinstance(idx, slice):
            assert self._slice is None
            return ContainerArrayView(self.tree, dtype=self.dtype, _slice=idx)
        else:
            raise NotImplementedError

    # TODO implement append

    def __setitem__(
        self,
        idx: int,
        val: Any
    ):
        if self._slice is not None:
            raise NotImplementedError

        assert isinstance(idx, int)
        self.tree[idx] = val


    def numpy(self) -> np.ndarray:
        # TODO URGENT implement using cython
        val = self.tolist()
        assert isinstance(val, list)
        return np.array(val, dtype=self.dtype)

    def encode(self) -> bytes:
        # TODO from cython
        return self.numpy().dumps()

    def tolist(self) -> List[T]:
        arr = self.tree[...]
        if self._slice is not None:
            arr = arr[self._slice]
        assert isinstance(arr, list)
        return arr
