from typing import Generic, Union, Tuple, List, TypeVar, Dict

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
        run: 'Run'
    ):
        self.name = name
        self.context = context
        self.run = run

        self._sequence_meta_tree = None
        self._series_tree = run.series_run_tree.subtree((context.idx, name))

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
    def sequence_name(cls) -> str:
        """classmethod to get retrieve sequence's registered name"""
        ...

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
    def values(self) -> ArrayView:
        """Tracked values array as :obj:`ArrayView`.

            :getter: Returns values ArrayView.
        """
        return self._series_tree.array('val')

    @property
    def indices(self) -> List[int]:
        """Metric tracking steps as :obj:`list`.

            :getter: Returns steps list.
        """
        array_view = [i for i, _ in enumerate(self.values)]
        return array_view

    @property
    def epochs(self) -> ArrayView:
        """Tracked epochs array as :obj:`ArrayView`.

            :getter: Returns epochs ArrayView.
        """
        return self._series_tree.array('epoch', dtype='float64')

    @property
    def timestamps(self) -> ArrayView:
        """Tracked timestamps array as :obj:`ArrayView`.

            :getter: Returns timestamps ArrayView.
        """
        return self._series_tree.array('time', dtype='float64')

    @property
    def _meta_tree(self):
        if self._sequence_meta_tree is None:
            self._sequence_meta_tree = self.run.meta_run_tree.subtree(('traces', self.context.idx, self.name))
        return self._sequence_meta_tree

    def __bool__(self) -> bool:
        try:
            return bool(self.values)
        except ValueError:
            return False

    def __len__(self) -> int:
        return len(self.values)

    def preload(self):
        self._series_tree.preload()


class MediaSequenceBase(Sequence):
    """Helper class for media sequence types."""

    collections_allowed = True

    def first_step(self):
        """Get sequence tracked first step.

        Required to implement ranged and sliced data fetching.
        """
        return self._meta_tree['first_step']

    def last_step(self):
        """Get sequence tracked last step.

        Required to implement ranged and sliced data fetching.
        """
        return self._meta_tree['last_step']

    def record_length(self):
        """Get tracked records longest list length or `None` if Text objects are tracked.

        Required to implement ranged and sliced data fetching.
        """
        return self._meta_tree.get('record_max_length', None)
