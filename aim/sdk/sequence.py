from typing import Generic, Union, Tuple, List, TypeVar
from abc import abstractmethod
from copy import deepcopy

from aim.sdk.num_utils import convert_to_py_number
from aim.sdk.utils import get_object_typename

from aim.storage.arrayview import ArrayView
from aim.storage.context import Context
from aim.storage.hashing import hash_auto

from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from aim.sdk.run import Run


T = TypeVar('T')


class Sequence(Generic[T]):
    """Class representing single series of tracked value.

    Objects series can be retrieved as Sequence regardless the object's type,
    but subclasses of Sequence might provide additional functionality.
    Provides interface to access tracked values, steps, timestamps and epochs.
    Values, epochs and timestamps are accessed via :obj:`aim.storage.arrayview.ArrayView` interface.
    """
    def __init__(
        self,
        name: str,
        context: Context,  # TODO ?dict
        run: 'Run'
    ):
        self.name = name
        self.context = context
        self.run = run

        self._meta_tree = run.meta_run_tree.view(('traces', context.idx, name))
        self._tree = run.series_run_tree.view((context.idx, name))
        self._values = self._tree.array('val')
        self._epochs = self._tree.array('epoch')
        self._timestamps = self._tree.array('time')

        self._length: int = None
        self._hash: int = None

    def __repr__(self) -> str:
        return f'<Metric#{hash(self)} name=`{self.name}` context=`{self.context}` run=`{self.run}`>'

    @classmethod
    def allowed_dtypes(cls) -> Union[str, Tuple[str, ...]]:
        """classmethod to get allowed object types for particular sequence

        For example, numeric sequences a.k.a. Metric allow float and integer numbers.
        The base Sequence allows any value, and to indicate that, `allowed_dtypes` returns '*'.
        """
        return '*'

    @classmethod
    @abstractmethod
    def sequence_name(cls) -> str:
        ...

    def track(self, value, track_time: float, step: int, epoch: int):
        # since worker might be lagging behind, we want to log the timestamp of run.track() call,
        # not the actual implementation execution time.

        if self.run.track_in_thread:
            val = deepcopy(value)
            track_rate_warning = self.run.repo.tracking_queue.register_task(
                self._track_impl, val, track_time, step, epoch)
            if track_rate_warning:
                self.run.track_rate_warn()
        else:
            self._track_impl(value, track_time, step, epoch)

    def _track_impl(self, value, track_time: float, step: int, epoch: int):
        try:
            val = convert_to_py_number(value)
        except ValueError:
            # value is not a number
            val = value

        val_view = self._values.allocate()
        epoch_view = self._epochs.allocate()
        time_view = self._timestamps.allocate()

        max_idx = self._length
        if max_idx is None:
            max_idx = len(val_view)
        step = step or max_idx

        self._length = max_idx + 1

        if max_idx == 0:
            self._meta_tree['first_step'] = step
            # TODO [AT] check sequence is homogenious & handle empty list case
            self._meta_tree['dtype'] = get_object_typename(val)

        self._meta_tree['last'] = val
        self._meta_tree['last_step'] = step
        if isinstance(val, (tuple, list)):
            record_max_length = self._meta_tree.get('record_max_length', 0)
            self._meta_tree['record_max_length'] = max(record_max_length, len(val))

        # TODO perform assignments in an atomic way

        val_view[step] = val
        epoch_view[step] = epoch
        time_view[step] = track_time

    def _calc_hash(self):
        return hash_auto(
            (self.name,
             hash(self.context),
             hash(self.run))
        )

    def __hash__(self) -> int:
        if self._hash is None:
            self._hash = self._calc_hash()
        return self._hash

    @property
    def values(self) -> ArrayView[T]:
        """Tracked values array as :obj:`ArrayView`.

            :getter: Returns values ArrayView.
        """
        return self._values

    @property
    def indices(self) -> List[int]:
        """Metric tracking steps as :obj:`list`.

            :getter: Returns steps list.
        """
        array_view = [i for i, _ in enumerate(self.values)]
        return array_view

    @property
    def epochs(self) -> ArrayView[int]:
        """Tracked epochs array as :obj:`ArrayView`.

            :getter: Returns epochs ArrayView.
        """
        return self._epochs

    @property
    def timestamps(self) -> ArrayView[float]:
        """Tracked timestamps array as :obj:`ArrayView`.

            :getter: Returns timestamps ArrayView.
        """
        return self._timestamps

    def __bool__(self) -> bool:
        try:
            return bool(self.values)
        except ValueError:
            return False

    def __len__(self) -> int:
        return len(self.values)

    def preload(self):
        self._tree.preload()
