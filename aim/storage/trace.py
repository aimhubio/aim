from abc import abstractmethod
import datetime
import json
import time
import numpy as np
import wrapt
from tqdm import tqdm
from .types import AimObject
from .hashing import hash_auto
from .arrayview import ArrayView
from .context import Context
from . import encoding as E
from . import treeutils

from typing import Any, Generic, Iterable, Iterator, NamedTuple, TYPE_CHECKING, Tuple, TypeVar, List

if TYPE_CHECKING:
    from .run import Run
    from .repo import Repo
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
        run: 'Run'
    ):
        self.name = name
        self.context = context
        self.run = run

        self.tree = run.trace_tree(name, context)

        self._hash: int = None

    def __repr__(self) -> str:
        return f'<Trace#{hash(self)} name=`{self.name}` context=`{self.context}` run=`{self.run}`>'

    def _calc_hash(self):
        return hash_auto((self.name, hash(self.context), hash(self.run)))

    def __hash__(self) -> int:
        if self._hash is None:
            self._hash = self._calc_hash()
        return self._hash

    @property
    def values(self) -> ArrayView[T]:
        return self.tree.array('val')

    @property
    def iters(self) -> ArrayView[int]:
        return self.tree.array('iter')

    @property
    def steps(self) -> List[int]:
        return [i for i, _ in enumerate(self.iters)]

    @property
    def epochs(self) -> ArrayView[int]:
        return self.tree.array('epoch')

    @property
    def timestamps(self) -> ArrayView[float]:
        return self.tree.array('time')

    def __getitem__(
        self,
        idx: int
    ) -> Tuple[int, Any, float]:
        # TODO implement slice
        return self.iters[idx], self.valus[idx], self.time[idx]
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

    def __getitem__(self, step: int) -> Any:
        return Record(step, self.iters[step], self.values[step], self.timestamps[step])

    def dataframe(
        self,
        include_name: bool = False,
        include_context: bool = True,
        include_run: bool = False,
        trace_slice: slice = None
    ) -> 'DataFrame':
        # Returns dataframe with rows corresponding to iters
        # Columns: `step`, `value`, `time`
        # steps = list(self.steps)
        if trace_slice is None:
            trace_slice = slice(None, None, None)
        iters = self.iters.tolist()[trace_slice]
        steps = [i for i, _ in enumerate(iters)][trace_slice]
        values = self.values.tolist()[trace_slice]
        timestamps = [datetime.datetime.fromtimestamp(t) for t in self.timestamps.tolist()][trace_slice]
        data = {
            'step': steps,
            'iter': iters,
            'value': values,
            'time': timestamps
        }
        
        if include_run:
            data['run'] = [self.run.name] * len(iters)
            for path, val in treeutils.unfold_tree(self.run[...], unfold_array=False):
                s = 'run'
                for key in path:
                    if isinstance(key, str):
                        s += f'.{key}'
                    else:
                        s += f'[{key}]'
                # path = '.'.join(path)
                if isinstance(val, (tuple, list)):
                    val = json.dumps(val)
                data[s] = [val for _ in iters]
        if include_name:
            # df['metric'] = self.name
            data['metric'] = [self.name for _ in iters]
        if include_context:
            for path, val in treeutils.unfold_tree(self.context.to_dict(), unfold_array=False):
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
            trace.dataframe(include_run=True,
                            include_name=True,
                            include_context=True,
                            trace_slice=trace_slice)
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
        super().__init__(run=run, repo=run.repo)

    def iter(
        self
    ) -> Iterator[Trace]:
        for metric_name, ctx, run in self.run.iter_all_traces():
            yield Trace(metric_name, ctx, run)


class AimObjectProxy(wrapt.ObjectProxy):

    # NotFound = object()

    def __getattr__(self, name):
        try:
            val = super().__getattr__(name)
        except:
            if name in self.__wrapped__:
                return AimObjectProxy(self.__wrapped__[name])
            return None
        return val


class QueryTraceCollection(TraceCollection):
    def __init__(
        self,
        repo: 'Repo',
        query: str
    ):
        super().__init__(repo=repo)
        self.query = query

    def iter(self) -> Iterator[Trace]:
        for run in tqdm(self.repo.iter_runs(from_union=True)):
            for metric_name, ctx, run in run.iter_all_traces():
                statement = eval(self.query, dict(), dict(
                    metric_name=metric_name,
                    metric=metric_name,
                    context=ctx.to_dict(),
                    # context=AimObjectProxy(ctx.to_dict()),
                    # ctx=AimObjectProxy(ctx.to_dict()),
                    run=run #AimObjectProxy(run.meta_run_tree)
                ))
                if self.query and not statement:
                    continue
                yield Trace(metric_name, ctx, run)

        # for metric_name, ctx, run in self.from_repo():
        #     yield Trace(metric_name, ctx, run)
