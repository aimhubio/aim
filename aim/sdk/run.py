import logging

import datetime
from time import time
from collections import Counter

from aim.sdk.errors import RepoIntegrityError
from aim.sdk.metric import SingleRunMetricCollection
from aim.sdk.utils import generate_run_hash
from aim.sdk.num_utils import convert_to_py_number
from aim.sdk.types import AimObject

from aim.storage.hashing import hash_auto
from aim.storage.context import Context, MetricDescriptor
from aim.storage.treeview import TreeView

from aim.ext.resource import ResourceTracker, DEFAULT_SYSTEM_TRACKING_INT

from typing import Any, Dict, Iterator, Optional, Tuple, Union
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from aim.sdk.metric import Metric
    from aim.sdk.metric import MetricCollection
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
    def finalized_at(self):
        """Run finalization time [UTC] as datetime.

            :getter: Returns run finalization time.
        """
        return self.props.finalized_at

    @property
    def creation_time(self):
        """Run object creation time [UTC] as timestamp.

            :getter: Returns run creation time.
        """
        return self.props.creation_time

    @property
    def end_time(self):
        """Run finalization time [UTC] as timestamp.

            :getter: Returns run finalization time.
        """
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
         hashname (:obj:`str`, optional): Run's hashname. If skipped, generated automatically.
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
    _props_cache_hint: str = None

    def __init__(self, hashname: Optional[str] = None, *,
                 repo: Optional[Union[str, 'Repo']] = None,
                 read_only: bool = False,
                 experiment: Optional[str] = None,
                 system_tracking_interval: int = DEFAULT_SYSTEM_TRACKING_INT):
        hashname = hashname or generate_run_hash()

        if repo is None:
            from aim.sdk.repo import Repo
            repo = Repo.default_repo()
        elif isinstance(repo, str):
            from aim.sdk.repo import Repo
            repo = Repo.from_path(repo)

        self.repo = repo
        self.read_only = read_only
        if not read_only:
            logger.debug(f'Opening Run {hashname} in write mode')

        self.hashname = hashname
        self._hash = None
        self._props = None

        self.contexts: Dict[Context, int] = dict()

        self.meta_tree: TreeView = self.repo.request(
            'meta', hashname, read_only=read_only, from_union=True
        ).tree().view('meta')
        self.meta_run_tree: TreeView = self.meta_tree.view('chunks').view(hashname)

        self.meta_attrs_tree: TreeView = self.meta_tree.view('attrs')
        self.meta_run_attrs_tree: TreeView = self.meta_run_tree.view('attrs')

        self.series_run_tree: TreeView = self.repo.request(
            'trcs', hashname, read_only=read_only
        ).tree().view('trcs').view('chunks').view(hashname)
        if not read_only:
            # TODO: [AT] check this once Container db open locking is added
            self.series_run_tree.preload()

        self.series_counters: Dict[Tuple[Context, str], int] = Counter()

        self._system_resource_tracker: ResourceTracker = None
        if not read_only:
            self.props.finalized_at = None
            self._prepare_resource_tracker(system_tracking_interval)
        if experiment:
            self.experiment = experiment

    def __repr__(self) -> str:
        return f'<Run#{hash(self)} name={self.hashname} repo={self.repo}>'

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
        track_time = time()
        # TODO move to Metric
        if context is None:
            context = {}

        value = convert_to_py_number(value)

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
        self.meta_run_tree['traces', ctx.idx, name, "last"] = value

        self.series_counters[ctx, name] = max_idx + 1

        # TODO perform assignments in an atomic way

        if step is None:
            step = max_idx
        val_view[step] = value
        epoch_view[step] = epoch
        time_view[step] = track_time

    @classmethod
    def set_props_cache_hint(cls, cache: str):
        cls._props_cache_hint = cache

    @property
    def props(self):
        if self._props is None:
            self._init_props()
        return self._props

    def _init_props(self):
        sdb = self.repo.structured_db
        if self._props_cache_hint:
            self._props = sdb.caches[self._props_cache_hint][self.hashname]
        else:
            self._props = sdb.find_run(self.hashname)
            if not self._props:
                if self.read_only:
                    raise RepoIntegrityError(f'Missing props for Run {self.hashname}')
                else:
                    self._props = sdb.create_run(self.hashname)
                    self._props.experiment = 'default'

    def metric_tree(self, name: str, context: Context) -> TreeView:
        return self.series_run_tree.view((context.idx, name))

    def iter_metrics_info(self) -> Iterator[Tuple[str, Context, 'Run']]:
        """Iterator for all run metrics info.

        Yields:
            tuples of (metric_name, context, run) where run is the Run object itself.
        """
        for ctx_idx, run_ctx_view in self.meta_run_tree.view('traces').items():
            assert isinstance(ctx_idx, int)
            ctx = self.idx_to_ctx(ctx_idx)
            # run_ctx_view = run_meta_traces.view(ctx_idx)
            for metric_name in run_ctx_view.keys():
                assert isinstance(metric_name, str)
                yield metric_name, ctx, self

    def metrics(self) -> 'MetricCollection':
        """Get iterable object for all run tracked metrics.

        Returns:
            :obj:`MetricCollection`: Iterable for run metrics.

        Examples:
            >>> run = Run('3df703c')
            >>> for metric in run.metrics():
            >>>     metric.values.sparse_numpy()
        """
        return SingleRunMetricCollection(self)

    def __eq__(self, other: 'Run') -> bool:
        return self.hashname == other.hashname and self.repo == other.repo

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
        return hash_auto((self.hashname, hash(self.repo)))

    def __hash__(self) -> int:
        if self._hash is None:
            self._hash = self._calc_hash()
        return self._hash

    def __del__(self):
        if self.read_only:
            return
        if self._system_resource_tracker:
            self._system_resource_tracker.stop()

        logger.warning(f'finalizing {self}')
        self.finalize()

    def finalize(self):
        self.props.finalized_at = datetime.datetime.utcnow()
        index = self.repo._get_container('meta/index',
                                         read_only=False,
                                         from_union=False).view(b'')
        self.meta_run_tree.finalize(index=index)
