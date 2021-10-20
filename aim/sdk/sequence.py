from typing import Generic, Union, Tuple, List, TypeVar

from aim.storage.arrayview import ArrayView
from aim.storage.context import Context
from aim.storage.hashing import hash_auto

from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from aim.sdk.run import Run


T = TypeVar('T')


class Sequence(Generic[T]):
    # TODO move the core logic of Run.track here
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

        self.tree = run.metric_tree(name, context)

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
        array_view = self.tree.array('val')
        return array_view

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
        array_view = self.tree.array('epoch')
        return array_view

    @property
    def timestamps(self) -> ArrayView[float]:
        """Tracked timestamps array as :obj:`ArrayView`.

            :getter: Returns timestamps ArrayView.
        """
        array_view = self.tree.array('time')
        return array_view

    def __bool__(self) -> bool:
        try:
            return bool(self.values)
        except ValueError:
            return False

    def __len__(self) -> int:
        return len(self.values)

    def preload(self):
        self.tree.preload()
