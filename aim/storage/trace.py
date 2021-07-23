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
    idx: int
    step: int
    epoch: int
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
        array_view = self.tree.array('val')
        return array_view


    @property
    def indices(self) -> List[int]:
        array_view = [i for i, _ in enumerate(self.values)]
        return array_view

    @property
    def epochs(self) -> ArrayView[int]:
        array_view = self.tree.array('epoch')
        return array_view

    @property
    def timestamps(self) -> ArrayView[float]:
        array_view = self.tree.array('time')
        return array_view

    def __bool__(self) -> bool:
        return bool(self.values)

    def __len__(self) -> int:
        return len(self.values)

    def dataframe(
        self,
        include_name: bool = False,
        include_context: bool = False,
        include_run: bool = False,
        only_last: bool = False
    ) -> 'DataFrame':
        # Returns dataframe with rows corresponding to iters
        # Columns: `step`, `value`, `time`
        # steps = list(self.steps)
        if only_last:
            last_step, last_value = self.values.last()
            steps = [last_step]
            values = [last_value]
            epochs = [self.epochs[last_step]]
            timestamps = [self.timestamps[last_step]]
        else:
            steps, values = self.values.sparse_list()
            epochs = self.epochs.values_list()
            timestamps = self.timestamps.values_list()
        indices = [i for i, _ in enumerate(steps)]
        timestamps = [datetime.datetime.fromtimestamp(t) for t in timestamps]
        data = {
            'idx': indices,
            'step': steps,
            'value': values,
            'epoch': epochs,
            'time': timestamps
        }

        if include_run:
            data['run'] = [self.run.name] * len(indices)
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
                data[s] = [val for _ in indices]
        if include_name:
            # df['metric'] = self.name
            data['metric'] = [self.name for _ in indices]
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
                data[s] = [val for _ in indices]
        import pandas as pd
        df = pd.DataFrame(data)
        return df


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

    def dataframe(
        self,
        only_last: bool = False
    ) -> 'DataFrame':
        dfs = [
            trace.dataframe(include_run=True,
                            include_name=True,
                            include_context=True,
                            only_last=only_last)
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
        *,
        repo: 'Repo',
        query: str,
        run: 'Run' = None,
    ):
        self.repo: 'Repo'
        super().__init__(repo=repo, run=run)
        self.query = query
        self._query = RestrictedPythonQuery(query)

    def iter(self) -> Iterator[Trace]:
        if self.run is not None:
            runs = [self.run]
        else:
            runs = tqdm(self.repo.iter_runs(from_union=True))
        for run in runs:
            for metric_name, ctx, run in run.iter_all_traces():
                if not self._query:
                    statement = True
                else:
                    statement = self._query.match(
                        run=run,
                        context=ctx,
                        metric_name=metric_name
                    )
                if not statement:
                    continue
                yield Trace(metric_name, ctx, run)

    def iter_runs(self):
        assert self.run is None
        for run in tqdm(self.repo.iter_runs(from_union=True)):
            yield QueryTraceCollection(run=run, query=self.query, repo=self.repo)


class QueryRunTraceCollection(TraceCollection):
    def __init__(
        self,
        repo: 'Repo',
        query: str
    ):
        self.repo: 'Repo'
        super().__init__(repo=repo)
        self.query = query
        self._query = RestrictedPythonQuery(query)

    def iter(self) -> Iterator[Trace]:
        for run in self._iter_runs():
            for metric_name, ctx, run in run.iter_all_traces():
                yield Trace(metric_name, ctx, run)

    def _iter_runs(self) -> Iterator['Run']:
        for run in tqdm(self.repo.iter_runs(from_union=True)):
            if not self._query:
                statement = True
            else:
                statement = self._query.match(run=run)
            if not statement:
                continue
            yield run

    def iter_runs(self) -> Iterator['TraceCollection']:
        for run in self._iter_runs():
            yield RunTraceCollection(run)
