from abc import abstractmethod
import datetime
import json
import numpy as np
from tqdm import tqdm

from aim.storage import treeutils
from aim.storage.proxy import AimObjectProxy
from aim.storage.query import RestrictedPythonQuery
from aim.storage.context import Context
from aim.storage.hashing import hash_auto
from aim.storage.arrayview import ArrayView

from typing import Any, Generic, Iterable, Iterator, NamedTuple, TYPE_CHECKING, Tuple, TypeVar, List

if TYPE_CHECKING:
    from aim.storage.run import Run
    from aim.storage.repo import Repo
    from pandas import DataFrame

import logging
logger = logging.getLogger(__name__)


T = TypeVar('T')


class Record(NamedTuple):
    step: int
    iter: int
    value: Any
    time: float


class Trace(Generic[T]):
    # TODO move the core logic of Run.track here

    def __init__(
        self,
        name: str,
        context: Context,  # TODO ?dict
        run: 'Run',
        _slice: slice = None
    ):
        self.name = name
        self.context = context
        self.run = run

        self.tree = run.trace_tree(name, context)

        self._hash: int = None
        self._slice = _slice

    def __repr__(self) -> str:
        return f'<Trace#{hash(self)} name=`{self.name}` context=`{self.context}` run=`{self.run}`>'

    def _calc_hash(self):
        if self._slice is not None:
            slice_hash = hash_auto((self._slice.start, self._slice.stop, self._slice.step))
        else:
            slice_hash = None
        return hash_auto(
            (self.name,
             hash(self.context),
             hash(self.run),
             slice_hash
            )
        )

    def __hash__(self) -> int:
        if self._hash is None:
            self._hash = self._calc_hash()
        return self._hash

    @property
    def values(self) -> ArrayView[T]:
        array_view = self.tree.array('val')
        if self._slice is not None:
            array_view = array_view[self._slice]
        return array_view

    @property
    def iters(self) -> ArrayView[int]:
        array_view = self.tree.array('iter')
        if self._slice is not None:
            array_view = array_view[self._slice]
        return array_view

    @property
    def steps(self) -> List[int]:
        array_view = [i for i, _ in enumerate(self.iters)]
        if self._slice is not None:
            array_view = array_view[self._slice]
        return array_view

    @property
    def epochs(self) -> ArrayView[int]:
        array_view = self.tree.array('epoch')
        if self._slice is not None:
            array_view = array_view[self._slice]
        return array_view

    @property
    def timestamps(self) -> ArrayView[float]:
        array_view = self.tree.array('time')
        if self._slice is not None:
            array_view = array_view[self._slice]
        return array_view

    def __getitem__(
        self,
        idx: int
    ) -> Tuple[int, Any, float]:
        # TODO implement slice
        return self.iters[idx], self.values[idx], self.timestamps[idx]
        # Or shortcut from lower-level storage api

    def __len__(self) -> int:
        # if self.slice is None:
        return len(self.iters)
        # else:
        # Let's calc ...

    def __iter__(self) -> Iterator[Any]:
        # iter on `(step, value, time)` tuples maybe?
        # TODO iter iter over
        for s, (i, v, t) in enumerate(zip(self.iters,
                                          self.values,
                                          self.timestamps)):
            yield Record(s, i, v, t)

    def __getitem__(
        self,
        step: int
    ) -> Any:
        if isinstance(step, slice):
            # We do not support slice of slice right now
            assert self._slice is None

            return Trace(name=self.name,
                         context=self.context,
                         run=self.run,
                         _slice=step)
        return Record(step, self.iters[step], self.values[step], self.timestamps[step])

    def dataframe(
        self,
        include_name: bool = False,
        include_context: bool = False,
        include_run: bool = False
    ) -> 'DataFrame':
        # Returns dataframe with rows corresponding to iters
        # Columns: `step`, `value`, `time`
        # steps = list(self.steps)
        iters = self.iters.tolist()
        steps = [i for i, _ in enumerate(iters)]
        values = self.values.tolist()
        timestamps = [datetime.datetime.fromtimestamp(t) for t in self.timestamps.tolist()]
        data = {
            'step': steps,
            'iter': iters,
            'value': values,
            'time': timestamps
        }

        if include_run:
            data['run'] = [self.run.name] * len(iters)
            for path, val in treeutils.unfold_tree(self.run[...],
                                                   unfold_array=False,
                                                   depth=3):
                s = 'run'
                for key in path:
                    if isinstance(key, str):
                        s += f'.{key}'
                    else:
                        s += f'[{key}]'
                # path = '.'.join(path)
                if isinstance(val, (tuple, list, dict)):
                    val = json.dumps(val)
                data[s] = [val for _ in iters]
        if include_name:
            # df['metric'] = self.name
            data['metric'] = [self.name for _ in iters]
        if include_context:
            for path, val in treeutils.unfold_tree(self.context.to_dict(),
                                                   unfold_array=False,
                                                   depth=3):
                s = 'context'
                for key in path:
                    if isinstance(key, str):
                        s += f'.{key}'
                    else:
                        s += f'[{key}]'
                # path = '.'.join(path)
                if isinstance(val, (tuple, list)):
                    val = json.dumps(val)
                # df[s] = val
                data[s] = [val for _ in iters]
        import pandas as pd
        df = pd.DataFrame(data)
        return df

    def numpy(self) -> np.ndarray:
        # TODO return `iters` and `time` as well somehow
        # Maybe return Tuple of ndarrays instead?
        # Or `.iters.numpy()`, `.time.numpy()`, `.values.numpy()` ?
        return (
            np.array(self.steps),
            self.iters.numpy(),
            self.values.numpy(),
            self.timestamps.numpy()
        )


class TraceCollection:
    def __init__(
        self,
        run: 'Run' = None,
        metric_name: str = None,
        context: 'Context' = None,
        repo: 'Repo' = None
    ):
        self.metric_name = metric_name
        self.context = context
        self.run = run
        self.repo = repo

    @abstractmethod
    def dataframe(
        self,
        trace_slice: slice = None
    ) -> 'DataFrame':
        dfs = [
            trace[trace_slice].dataframe(include_run=True,
                            include_name=True,
                            include_context=True)
            for trace in self
        ]
        if not dfs:
            return None
        import pandas as pd
        return pd.concat(dfs)

    def __iter__(self) -> Iterator[Trace]:
        return self.iter()

    @abstractmethod
    def iter(self) -> Iterator[Trace]:
        ...

    def iter_series(self) -> Iterator[Trace]:
        # Alias to iter
        return self.iter()

    @abstractmethod
    def iter_contexts(self) -> Iterator['TraceCollection']:
        if self.context is not None:
            logger.warning('Context is already bound to the Collection.')
        ...

    @abstractmethod
    def iter_runs(self) -> Iterator['TraceCollection']:
        if self.run is not None:
            logger.warning('Run is already bound to the Collection')
        ...


class RunTraceCollection(TraceCollection):
    def __init__(
        self,
        run: 'Run'
    ):
        self.run: 'Run'
        self.repo: 'Repo'
        super().__init__(run=run, repo=run.repo)

    def iter(
        self
    ) -> Iterator[Trace]:
        for metric_name, ctx, run in self.run.iter_all_traces():
            yield Trace(metric_name, ctx, run)


class QueryTraceCollection(TraceCollection):
    def __init__(
        self,
        repo: 'Repo',
        query: str
    ):
        self.repo: 'Repo'
        super().__init__(repo=repo)
        self.query = RestrictedPythonQuery(query)

    def iter(self) -> Iterator[Trace]:
        for run in tqdm(self.repo.iter_runs(from_union=True)):
            for metric_name, ctx, run in run.iter_all_traces():
                if not self.query:
                    statement = True
                else:
                    statement = self.query.match(
                        run=run,
                        context=ctx,
                        metric_name=metric_name
                    )
                if not statement:
                    continue
                yield Trace(metric_name, ctx, run)
