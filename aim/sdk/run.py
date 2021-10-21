import logging

import datetime
import os

from time import time
from collections import Counter
from copy import deepcopy

from aim.sdk.errors import RepoIntegrityError
from aim.sdk.sequence_collection import SingleRunSequenceCollection
from aim.sdk.utils import generate_run_hash, get_object_typename
from aim.sdk.num_utils import convert_to_py_number
from aim.sdk.types import AimObject
from aim.sdk.configs import AIM_ENABLE_TRACKING_THREAD

from aim.storage.hashing import hash_auto
from aim.storage.context import Context, MetricDescriptor
from aim.storage.treeview import TreeView

from aim.ext.resource import ResourceTracker, DEFAULT_SYSTEM_TRACKING_INT

from typing import Any, Dict, Iterator, Optional, Tuple, Union
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from aim.sdk.metric import Metric
    from aim.sdk.sequence_collection import SequenceCollection
    from aim.sdk.repo import Repo


logger = logging.getLogger(__name__)


# TODO: [AT] generate automatically based on ModelMappedRun
class StructuredRunMixin:
    @property
    def name(self):
        """Run name, set by user.

            :getter: Returns run's name.
            :setter: Sets run's name.
            :type: string
        """
        return self.props.name

    @name.setter
    def name(self, value):
        self.props.name = value

    @property
    def description(self):
        """Run description, set by user.

            :getter: Returns run's description.
            :setter: Sets run's description.
            :type: string
        """
        return self.props.description

    @description.setter
    def description(self, value):
        self.props.description = value

    @property
    def archived(self):
        """Check is run archived or not.

            :getter: Returns run's archived state.
            :setter: Archive/un-archive run.
            :type: bool
        """
        return self.props.archived

    @archived.setter
    def archived(self, value):
        self.props.archived = value

    @property
    def created_at(self):
        """Run object creation time [UTC] as datetime.

            :getter: Returns run creation time.
        """
        return self.props.created_at

    @property
    def creation_time(self):
        """Run object creation time [UTC] as timestamp.

            :getter: Returns run creation time.
        """
        return self.props.creation_time

    @property
    def finalized_at(self):
        """Run finalization time [UTC] as datetime.

            :getter: Returns run finalization time.
        """
        end_time = self.end_time
        return datetime.datetime.fromtimestamp(end_time) if end_time else None

    @property
    def end_time(self):
        """Run finalization time [UTC] as timestamp.

            :getter: Returns run finalization time.
        """
        try:
            return self.meta_run_tree['end_time']
        except KeyError:
            # run saved with old version. fallback to sqlite data
            return self.props.end_time

    @property
    def updated_at(self):
        return self.props.updated_at

    @property
    def experiment(self):
        """Run experiment.

            :getter: Returns run's experiment name.
            :setter: Sets run's experiment.
            :type: string
        """
        return self.props.experiment

    @experiment.setter
    def experiment(self, value):
        self.props.experiment = value

    @property
    def tags(self):
        """List of run tags.

            :getter: Returns run's tag list.
        """
        return self.props.tags

    def add_tag(self, value):
        """Add tag to run

        Args:
            value (str): Tag to add.
        """
        return self.props.add_tag(value)

    def remove_tag(self, tag_id):
        """Remove run tag.

        Args:
            tag_id (str): :obj:`uuid` of tag to be removed.
        """
        return self.props.remove_tag(tag_id)


class Run(StructuredRunMixin):
    """Run object used for tracking metrics.

    Provides method :obj:`track` to track value series [metrics] for multiple metrics and contexts.
    Provides dictionary-like interface for Run object meta-parameters.
    Provides API for iterating tracked metrics.

    Args:
         run_hash (:obj:`str`, optional): Run's hash. If skipped, generated automatically.
         repo (:obj:`Union[Repo,str], optional): Aim repository path or Repo object to which Run object is bound.
            If skipped, default Repo is used.
         read_only (:obj:`bool`, optional): Run creation mode.
            Default is False, meaning Run object can be used to track metrics.
         experiment (:obj:`str`, optional): Sets Run's `experiment` property. 'default' if not specified.
            Can be used later to query runs/metrics.
         system_tracking_interval (:obj:`int`, optional): Sets the tracking interval in seconds for system usage
            metrics (CPU, Memory, etc.). Set to `None` to disable system metrics tracking.
    """

    _idx_to_ctx: Dict[int, Context] = dict()
    _finalize_message_shown = False
    _track_warning_shown = False

    def __init__(self, run_hash: Optional[str] = None, *,
                 repo: Optional[Union[str, 'Repo']] = None,
                 read_only: bool = False,
                 experiment: Optional[str] = None,
                 system_tracking_interval: Optional[int] = DEFAULT_SYSTEM_TRACKING_INT):
        self._constructed = False
        run_hash = run_hash or generate_run_hash()
        self.hash = run_hash
        self.track_in_thread = os.getenv(AIM_ENABLE_TRACKING_THREAD, False)

        self._finalized = False

        if repo is None:
            from aim.sdk.repo import Repo
            repo = Repo.default_repo_path()
        if isinstance(repo, str):
            from aim.sdk.repo import Repo, RepoStatus
            repo_status = Repo.check_repo_status(repo)
            if repo_status == RepoStatus.UPDATE_REQUIRED:
                logger.error(f'Trying to start Run on repository {repo}, which is out of date. '
                             f'Please upgrade repository with the following command: '
                             f'`aim upgrade --repo {repo} 2to3`.')
                raise RuntimeError()
            elif repo_status == RepoStatus.MISSING:
                repo = Repo.from_path(repo, init=True)
            else:
                repo = Repo.from_path(repo)

        self.repo = repo
        self.read_only = read_only
        if not read_only:
            logger.debug(f'Opening Run {self.hash} in write mode')

        self._hash = None
        self._props = None

        self.contexts: Dict[Context, int] = dict()

        self.meta_tree: TreeView = self.repo.request(
            'meta', self.hash, read_only=read_only, from_union=True
        ).tree().view('meta')
        self.meta_run_tree: TreeView = self.meta_tree.view('chunks').view(self.hash)

        self.meta_attrs_tree: TreeView = self.meta_tree.view('attrs')
        self.meta_run_attrs_tree: TreeView = self.meta_run_tree.view('attrs')

        self.series_run_tree: TreeView = self.repo.request(
            'seqs', self.hash, read_only=read_only
        ).tree().view('seqs').view('chunks').view(self.hash)

        self.series_counters: Dict[Tuple[Context, str], int] = Counter()

        self._system_resource_tracker: ResourceTracker = None
        if not read_only:
            try:
                self.meta_run_attrs_tree.first()
            except (KeyError, StopIteration):
                # no run params are set. use empty dict
                self[...] = {}
            self.meta_run_tree['end_time'] = None
            self.props
            self._prepare_resource_tracker(system_tracking_interval)
        if experiment:
            self.experiment = experiment
        self._constructed = True

    def __repr__(self) -> str:
        return f'<Run#{hash(self)} name={self.hash} repo={self.repo}>'

    def idx_to_ctx(self, idx: int) -> Context:
        ctx = Run._idx_to_ctx.get(idx)
        if ctx is not None:
            return ctx
        ctx = Context(self.meta_tree['contexts', idx])
        Run._idx_to_ctx[idx] = ctx
        self.contexts[ctx] = idx
        return ctx

    def __setitem__(self, key: str, val: Any):
        """Set Run top-level meta-parameter.

        Args:
             key (:obj:`str`): Top-level meta-parameter name. Use ellipsis to reset
                run's all meta-parameters.
             val: Meta-parameter value.

        Examples:
            >>> run = Run('3df703c')
            >>> run[...] = params
            >>> run['hparams'] = {'batch_size': 42}
        """
        self.meta_run_attrs_tree[key] = val
        self.meta_attrs_tree[key] = val

    def __getitem__(self, key):
        """Get run meta-parameter by key.

        Args:
            key: path to Run meta-parameter.
        Returns:
            Collected sub-tree of Run meta-parameters.
        Examples:
            >>> run = Run('3df703c')
            >>> run['hparams']  # -> {'batch_size': 42}
            >>> run['hparams', 'batch_size']  # -> 42
        """
        return self._collect(key)

    def get(self, key, default: Any = None, strict: bool = True):
        try:
            return self._collect(key, strict=strict)
        except KeyError:
            return default

    def _collect(self, key, strict: bool = True):
        return self.meta_run_attrs_tree.collect(key, strict=strict)

    def _prepare_resource_tracker(self, tracking_interval: int):
        if tracking_interval and isinstance(tracking_interval, int) and tracking_interval > 0:
            try:
                self._system_resource_tracker = ResourceTracker(self.track, tracking_interval)
            except ValueError:
                print('To track system resource usage '
                      'please set `system_tracking_interval` greater than 0 '
                      'and less than 1 day')
            else:
                self._system_resource_tracker.start()

    def __delitem__(self, key: str):
        """Remove key from run meta-params.
        Args:
            key: meta-parameter path
        """
        del self.meta_attrs_tree[key]
        del self.meta_run_attrs_tree[key]

    def track(
        self,
        value,
        name: str,
        step: int = None,
        epoch: int = None,
        *,
        context: AimObject = None,
    ):
        """Main method for tracking numeric value series.

        Args:
             value: The tracked value.
             name (str): Tracked metric name.
             step (:obj:`int`, optional): Metric tracking iteration. Auto-incremented if not specified.
             epoch (:obj:`int`, optional): The training epoch.
             context (:obj:`dict`, optional): Metric racking context.

        Appends the tracked value to metric series specified by `name` and `context`.
        """

        # since worker might be lagging behind, we want to log the timestamp of run.track() call,
        # not the actual implementation execution time.
        track_time = time()
        if self.track_in_thread:
            val = deepcopy(value)
            track_rate_warning = self.repo.tracking_queue.register_task(
                self._track_impl, val, track_time, name, step, epoch, context=context)
            if track_rate_warning:
                self.track_rate_warn()
        else:
            self._track_impl(value, track_time, name, step, epoch, context=context)

    def _track_impl(
        self,
        value,
        track_time: float,
        name: str,
        step: int = None,
        epoch: int = None,
        *,
        context: AimObject = None,
    ):
        # TODO move to Metric
        if context is None:
            context = {}

        try:
            val = convert_to_py_number(value)
        except ValueError:
            # value is not a number
            val = value

        ctx = Context(context)
        metric = MetricDescriptor(name, ctx)

        if ctx not in self.contexts:
            self.meta_tree['contexts', ctx.idx] = ctx.to_dict()
            self.meta_run_tree['contexts', ctx.idx] = ctx.to_dict()
            self.contexts[ctx] = ctx.idx
            self._idx_to_ctx[ctx.idx] = ctx

        val_view = self.series_run_tree.view(metric.selector).array('val').allocate()
        epoch_view = self.series_run_tree.view(metric.selector).array('epoch').allocate()
        time_view = self.series_run_tree.view(metric.selector).array('time').allocate()

        max_idx = self.series_counters.get((ctx, name), None)
        if max_idx is None:
            max_idx = len(val_view)
        if max_idx == 0:
            self.meta_tree['traces', ctx.idx, name] = 1
            self.meta_run_tree['traces', ctx.idx, name, 'dtype'] = get_object_typename(val)
        self.meta_run_tree['traces', ctx.idx, name, "last"] = val

        self.series_counters[ctx, name] = max_idx + 1

        # TODO perform assignments in an atomic way

        if step is None:
            step = max_idx
        val_view[step] = val
        epoch_view[step] = epoch
        time_view[step] = track_time

    @property
    def props(self):
        if self._props is None:
            self._init_props()
        return self._props

    def _init_props(self):
        sdb = self.repo.structured_db
        if self.repo.run_props_cache_hint:
            self._props = sdb.caches[self.repo.run_props_cache_hint][self.hash]
        if not self._props:
            self._props = sdb.find_run(self.hash)
            if not self._props:
                if self.read_only:
                    raise RepoIntegrityError(f'Missing props for Run {self.hash}')
                else:
                    self._props = sdb.create_run(self.hash)
                    self._props.experiment = 'default'
            if self.repo.run_props_cache_hint:
                sdb.caches[self.repo.run_props_cache_hint][self.hash] = self._props

    def metric_tree(self, name: str, context: Context) -> TreeView:
        return self.series_run_tree.view((context.idx, name))

    def iter_metrics_info(self) -> Iterator[Tuple[str, Context, 'Run']]:
        """Iterator for all run metrics info.

        Yields:
            tuples of (metric_name, context, run) where run is the Run object itself.
        """
        yield from self.iter_sequence_info_by_type(('float', 'int'))

    def iter_sequence_info_by_type(self, dtypes: Union[str, Tuple[str, ...]]) -> Iterator[Tuple[str, Context, 'Run']]:
        if isinstance(dtypes, str):
            dtypes = (dtypes,)
        for ctx_idx, run_ctx_dict in self.meta_run_tree.view('traces').items():
            assert isinstance(ctx_idx, int)
            ctx = self.idx_to_ctx(ctx_idx)
            # run_ctx_view = run_meta_traces.view(ctx_idx)
            for seq_name in run_ctx_dict.keys():
                assert isinstance(seq_name, str)
                # skip sequences not matching dtypes.
                # sequences with no dtype are considered to be float sequences.
                # '*' stands for all data types
                if '*' in dtypes or run_ctx_dict[seq_name].get('dtype', 'float') in dtypes:
                    yield seq_name, ctx, self

    def metrics(self) -> 'SequenceCollection':
        """Get iterable object for all run tracked metrics.

        Returns:
            :obj:`MetricCollection`: Iterable for run metrics.

        Examples:
            >>> run = Run('3df703c')
            >>> for metric in run.metrics():
            >>>     metric.values.sparse_numpy()
        """
        return SingleRunSequenceCollection(self)

    def __eq__(self, other: 'Run') -> bool:
        return self.hash == other.hash and self.repo == other.repo

    def get_metric(
            self,
            metric_name: str,
            context: Context
    ) -> Optional['Metric']:
        """Retrieve metric sequence by it's name and context.

        Args:
             metric_name (str): Tracked metric name.
             context (:obj:`Context`): Tracking context.

        Returns:
            :obj:`Metric` object if exists, `None` otherwise.
        """
        from aim.sdk.metric import Metric
        metric = Metric(metric_name, context, self)
        return metric if bool(metric) else None

    def collect_metrics_info(self) -> list:
        """Retrieve Run's all metrics general overview.

        Returns:
             :obj:`list`: list of metric's `context`, `metric_name` and last tracked value triplets.
        """
        metrics = self.meta_run_tree.view('traces')
        metrics_overview = []
        for idx in metrics.keys():
            ctx_dict = self.idx_to_ctx(idx).to_dict()
            for metric_name, value in metrics[idx].items():
                metrics_overview.append({
                    'context': ctx_dict,
                    'metric_name': metric_name,
                    'last_value': value
                })
        return metrics_overview

    def _calc_hash(self) -> int:
        # TODO maybe take read_only flag into account?
        return hash_auto((self.hash, hash(self.repo)))

    def __hash__(self) -> int:
        if self._hash is None:
            self._hash = self._calc_hash()
        return self._hash

    def __del__(self):
        if self.read_only or not self._constructed:
            return
        if self._system_resource_tracker:
            self._system_resource_tracker.stop()

        logger.debug(f'finalizing {self}')
        self.finalize(skip_wait=True)

    @classmethod
    def finalize_msg(cls):
        if not cls._finalize_message_shown:
            logger.warning('Finalizing runs.')
            cls._finalize_message_shown = True

    @classmethod
    def track_rate_warn(cls):
        if not cls._track_warning_shown:
            # TODO [AT] add link to FAQ section in docs.
            logger.warning('Tracking task queue is almost full which might cause performance degradation. '
                           'Consider tracking at lower pace.')
            cls._track_warning_shown = True

    def finalize(self, skip_wait=False):
        if self._finalized:
            return
        self._finalized = True
        self.finalize_msg()
        if not skip_wait and self.track_in_thread:
            self.repo.tracking_queue.wait_for_finish()

        self.meta_run_tree['end_time'] = datetime.datetime.utcnow().timestamp()
        index = self.repo._get_container('meta/index',
                                         read_only=False,
                                         from_union=False).view(b'')
        self.meta_run_tree.finalize(index=index)
