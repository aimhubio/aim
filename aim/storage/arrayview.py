import numpy as np

from typing import Any, Generic, Iterator, List, TYPE_CHECKING, Tuple, TypeVar, Union
if  TYPE_CHECKING:
    from .treeview import TreeView


T = TypeVar("T")


class ArrayView(Generic[T]):
    def __init__(
        self,
        tree: 'TreeView',
        dtype: Any = None,
        slice: slice = None
    ):
        self.tree = tree
        self.dtype = dtype
        self.slice = slice

    def allocate(self):
        self.tree.make_array()
        return self

    def __iter__(self) -> Iterator[T]:
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
            # TODO lazier
            return self.tolist()[idx]
        else:
            raise NotImplementedError

    # TODO implement append

    def __setitem__(
        self,
        idx: int,
        val: Any
    ):
        assert isinstance(idx, int)
        self.tree[idx] = val

    def numpy(self) -> np.ndarray:
        return self.tree.numpy(dtype=self.dtype)

    def encode(self) -> bytes:
        # TODO from cython
        return self.numpy().dumps()

    def tolist(self) -> List[T]:
        arr = self.tree[...]
        assert isinstance(arr, list)
        return arr
