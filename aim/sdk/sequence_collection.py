import logging

from abc import abstractmethod
from typing import TYPE_CHECKING, Iterator

from aim.sdk.query_analyzer import QueryExpressionTransformer
from aim.sdk.query_utils import RunView, SequenceView
from aim.sdk.sequence import Sequence
from aim.sdk.types import QueryReportMode
from aim.storage.query import RestrictedPythonQuery
from tqdm import tqdm


if TYPE_CHECKING:
    from aim.sdk.repo import Repo
    from aim.sdk.run import Run
    from pandas import DataFrame

logger = logging.getLogger(__name__)


class SequenceCollection:
    """Abstract interface for collection of tracked series/sequences.

    Typically represents sequences of a same run or sequences matching given query expression.
    """

    # TODO [AT]: move to a separate mixin class
    def dataframe(
        self,
        only_last: bool = False,
        include_run=True,
        include_name=True,
        include_context=True,
        include_props=True,
        include_params=True,
    ) -> 'DataFrame':
        # TODO [GA]: Separate runs and sequences dataframes collection
        dfs = []
        if self._item == 'run':
            dfs = [
                run.run.dataframe(include_props=include_props, include_params=include_params)
                for run in self.iter_runs()
            ]
        elif self._item == 'sequence':
            dfs = [
                metric.dataframe(
                    include_run=include_run,
                    include_name=include_name,
                    include_context=include_context,
                    only_last=only_last,
                )
                for metric in self
            ]
        if not dfs:
            return None
        import pandas as pd

        return pd.concat(dfs)

    def __iter__(self) -> Iterator[Sequence]:
        return self.iter()

    @abstractmethod
    def iter(self) -> Iterator[Sequence]:
        """Get Sequence iterator for collection's sequences.

        Yields:
            Next sequence object based on implementation.
        """
        ...

    @abstractmethod
    def iter_runs(self) -> Iterator['SequenceCollection']:
        """Get SequenceCollection iterator for collection's runs.

        Yields:
            Next run's SequenceCollection based on implementation.
        """
        ...


class SingleRunSequenceCollection(SequenceCollection):
    """Implementation of SequenceCollection interface for a single Run.

    Method `iter()` returns Sequence iterator which yields Sequence matching query from run's sequences.
    Method `iter_runs()` raises StopIteration, since the collection is bound to a single Run.

    Args:
         run (:obj:`Run`): Run object for which sequences are queried.
         seq_cls (:obj:`type`): The collection's sequence class. Sequences not matching to seq_cls.allowed_dtypes
            will be skipped. `Sequence` by default, meaning all sequences will match.
         query (:obj:`str`, optional): Query expression. If specified, method `iter()` will return iterator for
            sequences matching the query. If not, method `iter()` will return iterator for run's all sequences.
    """

    def __init__(
        self,
        run: 'Run',
        seq_cls=Sequence,
        query: str = '',
        runs_proxy_cache: dict = None,
        timezone_offset: int = 0,
    ):
        self.run: 'Run' = run
        self.seq_cls = seq_cls
        self._item = 'sequence'
        self.query = RestrictedPythonQuery(query)
        self.runs_proxy_cache = runs_proxy_cache
        self._timezone_offset = timezone_offset

    def iter_runs(self) -> Iterator['SequenceCollection']:
        """"""
        logger.warning('Run is already bound to the Collection')
        raise StopIteration

    def iter(self) -> Iterator[Sequence]:
        """"""
        allowed_dtypes = self.seq_cls.allowed_dtypes()
        seq_var = self.seq_cls.sequence_name()
        for seq_name, ctx, run in self.run.iter_sequence_info_by_type(allowed_dtypes):
            run_view = RunView(run, self.runs_proxy_cache, self._timezone_offset)
            seq_view = SequenceView(seq_name, ctx.to_dict(), run_view)
            match = self.query.check(**{'run': run_view, seq_var: seq_view})
            if not match:
                continue
            yield self.seq_cls(seq_name, ctx, run)


class QuerySequenceCollection(SequenceCollection):
    """Implementation of SequenceCollection interface for repository's sequences matching given query.

    Method `iter()` returns Sequence iterator, which yields Sequence matching query from currently
    iterated run's sequences. Once there are no sequences left in current run, repository's next run is considered.
    Method `iter_runs()` returns SequenceCollection iterator for repository's runs.

    Args:
         repo (:obj:`Repo`): Aim repository object.
         seq_cls (:obj:`type`): The collection's sequence class. Sequences not matching to seq_cls.allowed_dtypes
            will be skipped. `Sequence` by default, meaning all sequences will match.
         query (:obj:`str`, optional): Query expression. If specified, method `iter()` will skip sequences not matching
            the query. If not, method `iter()` will return iterator for all sequences in repository
            (that's a lot of sequences!).
    """

    def __init__(
        self,
        repo: 'Repo',
        seq_cls=Sequence,
        query: str = '',
        report_mode: QueryReportMode = QueryReportMode.PROGRESS_BAR,
        timezone_offset: int = 0,
    ):
        self.repo: 'Repo' = repo
        self.seq_cls = seq_cls
        self._item = 'sequence'
        self.query = query
        self.report_mode = report_mode
        self.runs_proxy_cache = dict()
        self._timezone_offset = timezone_offset

    def iter_runs(self) -> Iterator['SequenceCollection']:
        """"""
        if self.repo.structured_db:
            runs_iterator = self.repo.iter_runs_from_cache()
        else:
            runs_iterator = self.repo.iter_runs()
        runs_counter = 1
        total_runs = self.repo.total_runs_count()

        if self.report_mode == QueryReportMode.PROGRESS_BAR:
            progress_bar = tqdm(total=total_runs)

        seq_var = self.seq_cls.sequence_name()
        t = QueryExpressionTransformer(
            var_names=[
                seq_var,
            ]
        )
        run_expr, is_transformed = t.transform(self.query)
        run_query = RestrictedPythonQuery(run_expr)

        for run in runs_iterator:
            check_run_sequences = True
            if is_transformed:
                run_view = RunView(run, runs_proxy_cache=self.runs_proxy_cache, timezone_offset=self._timezone_offset)
                match = run_query.check(**{'run': run_view})
                if not match:
                    check_run_sequences = False

            if check_run_sequences:
                seq_collection = SingleRunSequenceCollection(
                    run,
                    self.seq_cls,
                    self.query,
                    runs_proxy_cache=self.runs_proxy_cache,
                    timezone_offset=self._timezone_offset,
                )
                if self.report_mode == QueryReportMode.PROGRESS_TUPLE:
                    yield seq_collection, (runs_counter, total_runs)
                else:
                    if self.report_mode == QueryReportMode.PROGRESS_BAR:
                        progress_bar.update(1)
                    yield seq_collection
            runs_counter += 1

    def iter(self) -> Iterator[Sequence]:
        """"""
        if self.report_mode == QueryReportMode.PROGRESS_TUPLE:
            for run_seq, _ in self.iter_runs():
                yield from run_seq
        else:
            for run_seq in self.iter_runs():
                yield from run_seq


class QueryRunSequenceCollection(SequenceCollection):
    """Implementation of SequenceCollection interface for repository's runs matching given query.

    Method `iter()` returns Sequence iterator which yields Sequence for current run's all sequences.
    Method `iter_runs()` returns SequenceCollection iterator from repository's runs matching given query.

    Args:
         repo (:obj:`Repo`): Aim repository object.
         seq_cls (:obj:`type`): The collection's sequence class. Sequences not matching to seq_cls.allowed_dtypes
            will be skipped. `Sequence` by default, meaning all sequences will match.
         query (:obj:`str`, optional): Query expression. If specified, method `iter_runs()` will skip runs not matching
            the query. If not, method `iter_run()` will return SequenceCollection iterator for all runs in repository.
    """

    def __init__(
        self,
        repo: 'Repo',
        seq_cls=Sequence,
        query: str = '',
        paginated: bool = False,
        offset: str = None,
        report_mode: QueryReportMode = QueryReportMode.PROGRESS_BAR,
        timezone_offset: int = 0,
    ):
        self.repo: 'Repo' = repo
        self.seq_cls = seq_cls
        self.query = query
        self._item = 'run'
        self.paginated = paginated
        self.offset = offset
        self.query = RestrictedPythonQuery(query)
        self.report_mode = report_mode
        self._timezone_offset = timezone_offset

    def iter(self) -> Iterator[Sequence]:
        """"""
        if self.report_mode == QueryReportMode.PROGRESS_TUPLE:
            for run_seq, _ in self.iter_runs():
                yield from run_seq
        else:
            for run_seq in self.iter_runs():
                yield from run_seq

    def iter_runs(self) -> Iterator['SequenceCollection']:
        """"""
        if self.repo.structured_db:
            runs_iterator = self.repo.iter_runs_from_cache(offset=self.offset)
        else:
            runs_iterator = self.repo.iter_runs()
        runs_counter = 1
        total_runs = self.repo.total_runs_count()
        if self.report_mode == QueryReportMode.PROGRESS_BAR:
            progress_bar = tqdm(total=total_runs)
        for run in runs_iterator:
            run_view = RunView(run, timezone_offset=self._timezone_offset)
            match = self.query.check(run=run_view)
            seq_collection = SingleRunSequenceCollection(run, self.seq_cls) if match else None
            if self.report_mode == QueryReportMode.PROGRESS_TUPLE:
                yield seq_collection, (runs_counter, total_runs)
            else:
                if self.report_mode == QueryReportMode.PROGRESS_BAR:
                    progress_bar.update(1)
                if match:
                    yield seq_collection
            runs_counter += 1
