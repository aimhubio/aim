import datetime
import json
import logging

from abc import abstractmethod

from aim.sdk.query_utils import RunView, MetricView
from aim.storage import treeutils
from aim.storage.arrayview import ArrayView
from aim.storage.context import Context
from aim.storage.hashing import hash_auto
from aim.storage.query import RestrictedPythonQuery

from typing import Generic, Iterator, List, TypeVar
from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from aim.sdk.run import Run
    from aim.sdk.repo import Repo
    from pandas import DataFrame

logger = logging.getLogger(__name__)


T = TypeVar('T')


class Metric(Generic[T]):
    # TODO move the core logic of Run.track here
    """Class representing single tracked metric series.

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
        return bool(self.values)

    def __len__(self) -> int:
        return len(self.values)

    def preload(self):
        self.tree.preload()

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
        self.preload()

        if only_last:
            last_step, last_value = self.values.last()
            steps = [last_step]
            values = [last_value]
            epochs = [self.epochs[last_step]]
            timestamps = [self.timestamps[last_step]]
        else:
            try:
                steps, values = self.values.sparse_list()
                epochs = self.epochs.values_list()
                timestamps = self.timestamps.values_list()
            except ValueError:
                steps = []
                values = []
                epochs = []
                timestamps = []
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
            data['run'] = [self.run.hashname] * len(indices)
            for path, val in treeutils.unfold_tree(self.run[...],
                                                   unfold_array=False,
                                                   depth=3):
                s = 'run'
                for key in path:
                    if isinstance(key, str):
                        s += f'.{key}'
                    else:
                        s += f'[{key}]'

                if isinstance(val, (tuple, list, dict)):
                    val = json.dumps(val)
                data[s] = [val for _ in indices]
        if include_name:
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


class MetricCollection:
    """Abstract interface for collection of tracked metric series.

    Typically represents metrics of a same run or metrics matching given query expression.
    """

    def dataframe(
        self,
        only_last: bool = False,
        include_run=True,
        include_name=True,
        include_context=True
    ) -> 'DataFrame':
        dfs = [
            metric.dataframe(include_run=include_run,
                             include_name=include_name,
                             include_context=include_context,
                             only_last=only_last)
            for metric in self
        ]
        if not dfs:
            return None
        import pandas as pd
        return pd.concat(dfs)

    def __iter__(self) -> Iterator[Metric]:
        return self.iter()

    @abstractmethod
    def iter(self) -> Iterator[Metric]:
        """Get Metric iterator for collection's metrics.

        Yields:
            Next metric object based on implementation.
        """
        ...

    @abstractmethod
    def iter_runs(self) -> Iterator['MetricCollection']:
        """Get MetricCollection iterator for collection's runs.

        Yields:
            Next run's MetricCollection based on implementation.
        """
        ...


class SingleRunMetricCollection(MetricCollection):
    """Implementation of MetricCollection interface for a single Run.

    Method `iter()` returns Metric iterator which yields Metric matching query from run's metrics.
    Method `iter_runs()` raises StopIteration, since the collection is bound to a single Run.

    Args:
         run (:obj:`Run`): Run object for which metrics are queried.
         query (:obj:`str`, optional): Query expression. If specified, method `iter()` will return iterator for metrics
            matching the query. If not, method `iter()` will return iterator for run's all metrics.
    """
    def __init__(
        self,
        run: 'Run',
        query: str = None
    ):
        self.run: 'Run' = run
        if query:
            self.query = RestrictedPythonQuery(query)
        else:
            self.query = None

    def iter_runs(self) -> Iterator['MetricCollection']:
        """"""
        logger.warning('Run is already bound to the Collection')
        raise StopIteration

    def iter(
        self
    ) -> Iterator[Metric]:
        """"""
        for metric_name, ctx, run in self.run.iter_metrics_info():
            if not self.query:
                statement = True
            else:
                run_view = RunView(run)
                metric_view = MetricView(metric_name, ctx.to_dict(), run_view)
                statement = self.query.match(run=run_view, metric=metric_view)
            if not statement:
                continue
            yield Metric(metric_name, ctx, run)


class QueryMetricCollection(MetricCollection):
    """Implementation of MetricCollection interface for repository's metrics matching given query.

    Method `iter()` returns Metric iterator, which yields Metric matching query from currently iterated run's metrics.
    Once there are no metrics left in current run, repository's next run is considered.
    Method `iter_runs()` returns MetricCollection iterator for repository's runs.

    Args:
         repo (:obj:`Repo`): Aim repository object.
         query (:obj:`str`, optional): Query expression. If specified, method `iter()` will skip metrics not matching
            the query. If not, method `iter()` will return iterator for all metrics in repository
            (that's a lot of metric series!).
    """

    def __init__(
        self,
        repo: 'Repo',
        query: str = ''
    ):
        self.repo: 'Repo' = repo
        self.query = query

    def iter_runs(self) -> Iterator['MetricCollection']:
        """"""
        for run in self.repo.iter_runs():
            yield SingleRunMetricCollection(run, self.query)

    def iter(self) -> Iterator[Metric]:
        """"""
        for run_metrics in self.iter_runs():
            yield from run_metrics


class QueryRunMetricCollection(MetricCollection):
    """Implementation of MetricCollection interface for repository's runs matching given query.

    Method `iter()` returns Metric iterator which yields Metric for current run's all metrics.
    Method `iter_runs()` returns MetricCollection iterator from repository's runs matching given query.

    Args:
         repo (:obj:`Repo`): Aim repository object.
         query (:obj:`str`, optional): Query expression. If specified, method `iter_runs()` will skip runs not matching
            the query. If not, method `iter_run()` will return MetricCollection iterator for all runs in repository.
    """

    def __init__(
        self,
        repo: 'Repo',
        query: str,
        paginated: bool = False,
        offset: str = None
    ):
        self.repo: 'Repo' = repo
        self.query = query
        self.paginated = paginated
        self.offset = offset
        if query:
            self.query = RestrictedPythonQuery(query)

    def iter(self) -> Iterator[Metric]:
        """"""
        for run_metrics in self.iter_runs():
            yield from run_metrics

    def iter_runs(self) -> Iterator['MetricCollection']:
        """"""
        if self.paginated:
            runs_iterator = self.repo.iter_runs_from_cache(offset=self.offset)
        else:
            runs_iterator = self.repo.iter_runs()
        for run in runs_iterator:
            if not self.query:
                statement = True
            else:
                run_view = RunView(run)
                statement = self.query.match(run=run_view)
            if not statement:
                continue
            yield SingleRunMetricCollection(run)
