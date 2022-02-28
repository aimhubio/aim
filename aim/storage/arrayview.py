import numpy as np

from typing import Any, Iterator, List, Tuple, Union


class ArrayView:
    """Array of homogeneous elements with sparse indices.
    Interface for working with array as a non-sparse array is available for cases
    when index values are not important.
    """

    def __iter__(self) -> Iterator[Any]:
        ...

    def keys(self) -> Iterator[int]:
        """Return sparse indices iterator.

        Yields:
             Array's next sparse index.
        """
        ...

    def indices(self) -> Iterator[int]:
        """Return sparse indices iterator.

        Yields:
             Array's next sparse index.
        """
        ...

    def values(self) -> Iterator[Any]:
        """Return values iterator.

        Yields:
             Array's next value.
        """
        ...

    def items(self) -> Iterator[Tuple[int, Any]]:
        """Return items iterator.

        Yields:
            Tuple of array's next sparse index and value.
        """
        ...

    # TODO [AT]: maybe we need to have a view(slice) method instead?
    # TODO [AT]: it will have the same ArrayView interface but implement values, items, ... with slicing logic
    def values_slice(self, _slice: slice, slice_by: str = 'step') -> Iterator[Any]:
        ...

    def items_slice(self, _slice: slice, slice_by: str = 'step') -> Iterator[Tuple[int, Any]]:
        ...

    def values_in_range(self, start, stop, count=None) -> Iterator[Any]:
        ...

    def items_in_range(self, start, stop, count=None) -> Iterator[Tuple[int, Any]]:
        ...

    def __len__(self) -> int:
        ...

    def __getitem__(
        self,
        idx: Union[int, slice]
    ):
        ...

    # TODO implement append

    def __setitem__(
        self,
        idx: int,
        val: Any
    ):
        ...

    def sparse_list(self) -> Tuple[List[int], List[Any]]:
        """Get sparse indices and values as :obj:`list`s.
        """
        ...

    def indices_list(self) -> List[int]:
        """Get sparse indices as a :obj:`list`.
        """
        ...

    def values_list(self) -> List[Any]:
        """Get values as a :obj:`list`.
        """
        ...

    def sparse_numpy(self) -> Tuple[np.ndarray, np.ndarray]:
        """Get sparse indices and values as numpy arrays.
        """
        ...

    def indices_numpy(self) -> np.ndarray:
        """Get sparse indices as numpy array.
        """
        ...

    def values_numpy(self) -> np.ndarray:
        """Get values as numpy array.
        """
        ...

    def tolist(self) -> List[Any]:
        """Convert to values list"""
        ...

    def first(self) -> Tuple[int, Any]:
        """First index and value of the array.
        """
        ...

    def first_idx(self) -> int:
        """First index of the array.
        """
        ...

    def first_value(self) -> Any:
        """First value of the array.
        """
        ...

    def last(self) -> Tuple[int, Any]:
        """Last index and value of the array.
        """
        ...

    def last_idx(self) -> int:
        """Last index of the array.
        """
        ...

    def last_value(self) -> Any:
        """Last value of the array.
        """
        ...

    def min_idx(self) -> int:
        ...

    def max_idx(self) -> int:
        ...
