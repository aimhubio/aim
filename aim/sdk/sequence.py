import logging

from itertools import islice
from typing import (
    TYPE_CHECKING,
    Any,
    Dict,
    Generic,
    Iterator,
    List,
    Tuple,
    TypeVar,
    Union,
)

import numpy as np

from aim.sdk.tracker import STEP_HASH_FUNCTIONS
from aim.storage.arrayview import ArrayView
from aim.storage.context import Context
from aim.storage.hashing import hash_auto
from aim.storage.treeview import TreeView


if TYPE_CHECKING:
    from aim.sdk.run import Run


logger = logging.getLogger(__name__)


T = TypeVar('T')


class SequenceData:
    def __init__(self, series_tree, version: int, columns: List[Tuple[str, str]]):
        if len(columns) == 0:
            raise ValueError('Cannot create SequenceData. Please specify at least one column.')

        self.series_tree = series_tree
        self.version = version
        self.columns = columns
        self.arrays: Tuple[ArrayView] = tuple(self._get_array(col, dtype) for col, dtype in columns)

        self._dtype_map = {col: dtype for col, dtype in columns}
        self._step_hash_fn = STEP_HASH_FUNCTIONS[self.version]

    def step_hash(self, step):
        return self._step_hash_fn(step)

    def _checked_columns(self, columns: Union[str, List[str]]) -> List[Tuple[str, str]]:
        if isinstance(columns, str):
            columns = [columns]
        return [(col, self._dtype_map[col]) for col in columns if (col in self._dtype_map)]

    def _get_array(self, column: str, dtype: str = None) -> ArrayView:
        return self.series_tree.array(column, dtype=dtype)

    def view(self, columns: Union[str, Tuple[str]]):
        raise NotImplementedError

    def range(self, start, stop) -> 'SequenceData':
        raise NotImplementedError

    def sample(self, k) -> 'SequenceData':
        raise NotImplementedError

    def __iter__(self) -> Iterator[Tuple[int, Any]]:
        yield from self.items()

    def items(self) -> Iterator[Tuple[int, Any]]:
        steps, vals_list = self.items_list()
        yield from zip(steps, zip(*vals_list))

    def values(self) -> Iterator[Any]:
        yield from zip(self.values_list())

    def indices(self) -> Iterator[int]:
        yield from self.indices_list()

    def items_list(self) -> Tuple[List[int], List[Any]]:
        raise NotImplementedError

    def values_list(self) -> List[Any]:
        # default implementation
        return self.items_list()[1]

    def indices_list(self) -> List[int]:
        # default implementation
        return self.items_list()[0]

    def numpy(self) -> Tuple[np.ndarray, List[np.ndarray]]:
        # default implementation
        steps, vals_list = self.items_list()
        numpy_list = []
        for col_idx, vals in enumerate(vals_list):
            numpy_list.append(np.array(vals, dtype=self.arrays[col_idx].dtype))
        return np.array(steps, np.intp), numpy_list


class SequenceV1Data(SequenceData):
    def __init__(
        self, series_tree, *, columns: List[Tuple[str, str]], step_range: Tuple[int, int] = None, n_items: int = -1
    ):
        super().__init__(series_tree, version=1, columns=columns)
        self.step_range = step_range
        self.n_items = n_items

    def view(self, columns: List[str]) -> 'SequenceData':
        return SequenceV1Data(
            self.series_tree, columns=self._checked_columns(columns), step_range=self.step_range, n_items=self.n_items
        )

    def range(self, start, stop) -> 'SequenceData':
        return SequenceV1Data(self.series_tree, columns=self.columns, step_range=(start, stop), n_items=self.n_items)

    def sample(self, k) -> 'SequenceData':
        return SequenceV1Data(self.series_tree, columns=self.columns, step_range=self.step_range, n_items=k)

    def items_list(self) -> Tuple[List[int], List[Any]]:
        iters = self._get_iters()
        columns = [[] for _ in iters]
        steps = []

        if self.step_range is not None:
            start, stop = self.step_range
            if stop <= start or start < 0 or stop < 0:
                return
            for idx, val in iters[0]:
                if idx < start:
                    for it in iters[1:]:
                        next(it)
                    continue
                if idx >= stop:
                    break
                steps.append(idx)
                columns[0].append(val)
                for it_index, it in enumerate(iters[1:]):
                    columns[it_index + 1].append(next(it))
        else:
            for idx, val in iters[0]:
                steps.append(idx)
                columns[0].append(val)
                for it_index, it in enumerate(iters[1:]):
                    columns[it_index + 1].append(next(it))
        length = len(steps)
        step = (length // self.n_items or 1) if self.n_items > 0 else 1
        if step != 1:
            slice_ = slice(0, length, step)
            last_step_needed = (length - 1) % step != 0
            steps = steps[slice_] + [steps[-1]] if last_step_needed else steps[slice_]
            for i, v in enumerate(columns):
                columns[i] = v[slice_] + [v[-1]] if last_step_needed else v[slice_]

        return steps, columns

    def _get_iters(self) -> List[Iterator[Any]]:
        iters = [self.arrays[0].items()]
        for arr in self.arrays[1:]:
            iters.append(arr.values())
        return iters


class SequenceV2Data(SequenceData):
    def __init__(self, meta_tree, series_tree, *, columns: List[Tuple[str, str]], n_items: int = -1):
        super().__init__(series_tree, version=2, columns=columns)
        # `SequenceV2Data` has access to both metadata and series data
        # trees that are not necessarily based on the same physical storage.
        # Therefore, we don't have a consistency guarantee between the two.
        # The implemented methods should tolerate this.
        self.meta_tree = meta_tree
        self.n_items = n_items
        self.steps: ArrayView = self._get_array('step')

    def view(self, columns: List[str]) -> 'SequenceData':
        return SequenceV2Data(
            self.meta_tree, self.series_tree, columns=self._checked_columns(columns), n_items=self.n_items
        )

    def range(self, start, stop) -> 'SequenceData':
        raise ValueError('Range selection cannot be applied to data stored with reservoir sampling.')

    def sample(self, k) -> 'SequenceData':
        return SequenceV2Data(self.meta_tree, self.series_tree, columns=self.columns, n_items=k)

    def items_list(self) -> Tuple[List[int], List[Any]]:
        steps, values = self.numpy()
        return steps.tolist(), [v.tolist() for v in values]

    def numpy(self) -> Tuple[np.ndarray, List[np.ndarray]]:
        if self.n_items == -1:  # select all
            last_step = None
            steps = np.fromiter(self.steps.values(), np.intp)
            columns = [np.fromiter(arr.values(), arr.dtype) for arr in self.arrays]
        else:
            last_step = self.meta_tree.get('last_step', None)
            steps = np.fromiter(islice(self.steps.values(), self.n_items), np.intp)
            columns = [np.fromiter(islice(arr.values(), self.n_items), arr.dtype) for arr in self.arrays]

        # sort all columns by step
        sort_indices = steps.argsort()
        columns = [arr[sort_indices] for arr in columns]
        steps = steps[sort_indices]
        if last_step is not None and last_step != steps[-1]:
            step_hash = self.step_hash(last_step)
            # The `last_step` is provided by the meta tree which may potentially
            # be out of sync with the series tree.
            # If such case occurs, we fall back to the series tree for the last step.
            last_steps = []
            try:
                for i in range(len(columns)):
                    last_steps.append(self.arrays[i][step_hash])
            except KeyError:
                logger.debug('Last step not found in reservoir.')
            else:
                # Only if all the last steps are found, we use them.
                for i in range(len(columns)):
                    columns[i][-1] = last_steps[i]
                steps[-1] = last_step

        return steps, columns


class Sequence(Generic[T]):
    """Class representing single series of tracked value.

    Objects series can be retrieved as Sequence regardless the object's type,
    but subclasses of Sequence might provide additional functionality.
    Provides interface to access tracked values, steps, timestamps and epochs.
    Values, epochs and timestamps are accessed via :obj:`aim.storage.arrayview.ArrayView` interface.
    """

    registry: Dict[str, 'Sequence'] = dict()
    collections_allowed = False

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        subclass_typename = cls.sequence_name()
        if subclass_typename is not None:  # check for intermediate helper classes
            cls.registry[subclass_typename] = cls

    def __init__(
        self,
        name: str,
        context: Context,  # TODO ?dict
        run: 'Run',
    ):
        self._hash: int = None
        self._version: int = None
        self._meta_tree: TreeView = run.meta_run_tree.subtree(('traces', context.idx, name))
        self._series_tree: TreeView = None
        self._columns = [('val', None), ('epoch', 'float64'), ('time', 'float64')]
        self._data: SequenceData = None  # use data property

        self.name = name
        self.context = context
        self.run = run

    def __repr__(self) -> str:
        return f'<Sequence#{hash(self)} name=`{self.name}` context=`{self.context}` run=`{self.run}`>'

    @classmethod
    def allowed_dtypes(cls) -> Union[str, Tuple[str, ...]]:
        """classmethod to get allowed object types for particular sequence

        For example, numeric sequences a.k.a. Metric allow float and integer numbers.
        The base Sequence allows any value, and to indicate that, `allowed_dtypes` returns '*'.
        """
        return '*'

    @classmethod
    def sequence_name(cls) -> str:
        """classmethod to get retrieve sequence's registered name"""
        ...

    def _calc_hash(self):
        return hash_auto((self.name, hash(self.context), hash(self.run)))

    def __hash__(self) -> int:
        if self._hash is None:
            self._hash = self._calc_hash()
        return self._hash

    @property
    def series_tree(self) -> TreeView:
        if self._series_tree is None:
            self._series_tree = self.run.series_run_trees[self.version].subtree((self.context.idx, self.name))
        return self._series_tree

    @property
    def data(self) -> SequenceData:
        if self._data is None:
            if self.version == 1:
                self._data = SequenceV1Data(self.series_tree, columns=self._columns)
            else:
                self._data = SequenceV2Data(self._meta_tree, self.series_tree, columns=self._columns)
        return self._data

    @property
    def version(self):
        if self._version is None:
            self._version = self._meta_tree.get('version', 1)
        return self._version

    @property
    def values(self) -> ArrayView:
        """Tracked values array as :obj:`ArrayView`.

        :getter: Returns values ArrayView.
        """
        return self.data._get_array('val')

    @property
    def epochs(self) -> ArrayView:
        """Tracked epochs array as :obj:`ArrayView`.

        :getter: Returns epochs ArrayView.
        """
        return self.data._get_array('epoch', dtype='float64')

    @property
    def timestamps(self) -> ArrayView:
        """Tracked timestamps array as :obj:`ArrayView`.

        :getter: Returns timestamps ArrayView.
        """
        return self.data._get_array('time', dtype='float64')

    def __bool__(self) -> bool:
        try:
            return bool(self.values)
        except ValueError:
            return False

    def __len__(self) -> int:
        return len(self.values)

    def preload(self):
        self.series_tree.preload()

    def first_step(self):
        """Get sequence tracked first step.

        Required to implement ranged and sliced data fetching.
        """
        return self._meta_tree.get('first_step', 0)

    def last_step(self):
        """Get sequence tracked last step.

        Required to implement ranged and sliced data fetching.
        """
        # fallback to first_step() if 'last_step' key is not yet written
        return self._meta_tree.get('last_step', self.first_step())


class MediaSequenceBase(Sequence):
    """Helper class for media sequence types."""

    collections_allowed = True

    def record_length(self):
        """Get tracked records longest list length or `None` if Text objects are tracked.

        Required to implement ranged and sliced data fetching.
        """
        return self._meta_tree.get('record_max_length', None)
