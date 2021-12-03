import logging

import os
import datetime
import json

from collections import defaultdict
from time import time
from copy import deepcopy

from aim.sdk.errors import RepoIntegrityError
from aim.sdk.sequence import Sequence
from aim.sdk.sequence_collection import SingleRunSequenceCollection
from aim.sdk.utils import generate_run_hash, get_object_typename, check_types_compatibility
from aim.sdk.num_utils import convert_to_py_number
from aim.sdk.types import AimObject
from aim.sdk.configs import AIM_ENABLE_TRACKING_THREAD

from aim.storage.hashing import hash_auto
from aim.storage.context import Context, SequenceDescriptor
from aim.storage.treeview import TreeView
from aim.storage import treeutils

from aim.ext.resource import ResourceTracker, DEFAULT_SYSTEM_TRACKING_INT
from aim.ext.cleanup import AutoClean

from typing import Any, Dict, Iterator, Optional, Tuple, Union
from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from pandas import DataFrame

    from aim.sdk.metric import Metric
    from aim.sdk.image_sequence import Images
    from aim.sdk.distribution_sequence import Distributions
    from aim.sdk.sequence_collection import SequenceCollection
    from aim.sdk.repo import Repo


logger = logging.getLogger(__name__)


class RunAutoClean(AutoClean['Run']):
    PRIORITY = 90

    def __init__(self, instance: 'Run') -> None:
        """
        Prepare the `Run` for automatic cleanup.

        Args:
            instance: The `Run` instance to be cleaned up.
        """
        super().__init__(instance)

        self.read_only = instance.read_only
        self.name = instance.name
        self.meta_run_tree = instance.meta_run_tree
        self.repo = instance.repo
        self._system_resource_tracker = instance._system_resource_tracker

    def finalize_run(self):
        """
        Finalize the run by indexing all the data.
        """
        self.meta_run_tree['end_time'] = datetime.datetime.utcnow().timestamp()
        index = self.repo._get_container('meta/index',
                                         read_only=False,
                                         from_union=False).view(b'')
        logger.debug(f'Indexing Run {self.name}...')
        self.meta_run_tree.finalize(index=index)

    def finalize_system_tracker(self):
        """
        Stop the system resource tracker before closing the run.
        """
        if self._system_resource_tracker is not None:
            logger.debug('Stopping resource tracker')
            self._system_resource_tracker.stop()

    def _close(self) -> None:
        """
        Close the `Run` instance resources and trigger indexing.
        """
        if self.read_only:
            logger.debug(f'Run {self.name} is read-only, skipping cleanup')
            return
        self.finalize_system_tracker()
        self.finalize_run()


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


class SequenceInfo:
    def __init__(self):
        self.initialized = False
        self.count = None
        self.sequence_dtype = None


class Run(StructuredRunMixin):
    """Run object used for tracking metrics.

    Provides method :obj:`track` to track value and object series for multiple names and contexts.
    Provides dictionary-like interface for Run object meta-parameters.
    Provides API for iterating through tracked sequences.

    Args:
         run_hash (:obj:`str`, optional): Run's hash. If skipped, generated automatically.
         repo (:obj:`Union[Repo,str], optional): Aim repository path or Repo object to which Run object is bound.
            If skipped, default Repo is used.
         read_only (:obj:`bool`, optional): Run creation mode.
            Default is False, meaning Run object can be used to track metrics.
         experiment (:obj:`str`, optional): Sets Run's `experiment` property. 'default' if not specified.
            Can be used later to query runs/sequences.
         system_tracking_interval (:obj:`int`, optional): Sets the tracking interval in seconds for system usage
            metrics (CPU, Memory, etc.). Set to `None` to disable system metrics tracking.
    """

    _idx_to_ctx: Dict[int, Context] = dict()
    _track_warning_shown = False

    track_in_thread = os.getenv(AIM_ENABLE_TRACKING_THREAD, False)

    def __init__(self, run_hash: Optional[str] = None, *,
                 repo: Optional[Union[str, 'Repo']] = None,
                 read_only: bool = False,
                 experiment: Optional[str] = None,
                 system_tracking_interval: Optional[int] = DEFAULT_SYSTEM_TRACKING_INT):
        self._resources: Optional[RunAutoClean] = None
        run_hash = run_hash or generate_run_hash()
        self.hash = run_hash

        self._finalized = False

        self.repo: Repo = None
        self._set_repo(repo)

        self.read_only = read_only
        if not read_only:
            logger.debug(f'Opening Run {self.hash} in write mode')

        self._hash = None
        self._props = None

        self.contexts: Dict[Context, int] = dict()
        self.sequence_info: Dict[SequenceDescriptor.Selector, SequenceInfo] = defaultdict(SequenceInfo)

        self.meta_tree: TreeView = self.repo.request(
            'meta', self.hash, read_only=read_only, from_union=True
        ).tree().subtree('meta')
        self.meta_run_tree: TreeView = self.meta_tree.subtree('chunks').subtree(self.hash)

        self.meta_attrs_tree: TreeView = self.meta_tree.subtree('attrs')
        self.meta_run_attrs_tree: TreeView = self.meta_run_tree.subtree('attrs')

        self.series_run_tree: TreeView = self.repo.request(
            'seqs', self.hash, read_only=read_only
        ).tree().subtree('seqs').subtree('chunks').subtree(self.hash)

        self._system_resource_tracker: ResourceTracker = None
        self._prepare_resource_tracker(system_tracking_interval)

        if not read_only:
            try:
                self.meta_run_attrs_tree.first()
            except (KeyError, StopIteration):
                # no run params are set. use empty dict
                self[...] = {}
            self.meta_run_tree['end_time'] = None
            self.props
        if experiment:
            self.experiment = experiment

        self._resources = RunAutoClean(self)

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
        if not self.read_only and tracking_interval and isinstance(tracking_interval, int) and tracking_interval > 0:
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
        """Main method for tracking numeric value series and object series.

        Args:
             value: The tracked value.
             name (str): Tracked sequence name.
             step (:obj:`int`, optional): Sequence tracking iteration. Auto-incremented if not specified.
             epoch (:obj:`int`, optional): The training epoch.
             context (:obj:`dict`, optional): Sequence tracking context.

        Appends the tracked value to sequence specified by `name` and `context`.
        Appended values should be of the same type, in other words, sequence is a homogeneous collection.
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
        if context is None:
            context = {}
        try:
            val = convert_to_py_number(value)
        except ValueError:
            # value is not a number
            val = value
        dtype = get_object_typename(value)

        ctx = Context(context)
        sequence = SequenceDescriptor(name, ctx)

        if ctx not in self.contexts:
            self.meta_tree['contexts', ctx.idx] = context
            self.meta_run_tree['contexts', ctx.idx] = context
            self.contexts[ctx] = ctx.idx
            self._idx_to_ctx[ctx.idx] = ctx

        val_view = self.series_run_tree.subtree(sequence.selector).array('val').allocate()
        epoch_view = self.series_run_tree.subtree(sequence.selector).array('epoch').allocate()
        time_view = self.series_run_tree.subtree(sequence.selector).array('time').allocate()

        seq_info = self.sequence_info[sequence.selector]
        if not seq_info.initialized:
            seq_info.count = len(val_view)
            seq_info.sequence_dtype = self.meta_run_tree.get(('traces', ctx.idx, name, 'dtype'), None)
            if seq_info.count != 0 and seq_info.sequence_dtype is None:  # continue tracking on old sequence
                seq_info.sequence_dtype = 'float'
            seq_info.initialized = True

        if seq_info.sequence_dtype is not None:
            def update_trace_dtype(new_dtype):
                self.meta_tree['traces_types', new_dtype, ctx.idx, name] = 1
                seq_info.sequence_dtype = self.meta_run_tree['traces', ctx.idx, name, 'dtype'] = new_dtype
            compatible = check_types_compatibility(dtype, seq_info.sequence_dtype, update_trace_dtype)
            if not compatible:
                raise ValueError(f'Cannot log value \'{value}\' on sequence \'{name}\'. Incompatible data types.')

        step = step or seq_info.count

        if seq_info.count == 0:
            self.meta_tree['traces_types', dtype, ctx.idx, name] = 1
            seq_info.sequence_dtype = self.meta_run_tree['traces', ctx.idx, name, 'dtype'] = dtype
            self.meta_run_tree['traces', ctx.idx, name, 'first_step'] = step

        self.meta_run_tree['traces', ctx.idx, name, 'last'] = val
        self.meta_run_tree['traces', ctx.idx, name, 'last_step'] = step
        if isinstance(val, (tuple, list)):
            record_max_length = self.meta_run_tree.get(('traces', ctx.idx, name, 'record_max_length'), 0)
            self.meta_run_tree['traces', ctx.idx, name, 'record_max_length'] = max(record_max_length, len(val))

        # TODO perform assignments in an atomic way
        val_view[step] = val
        epoch_view[step] = epoch
        time_view[step] = track_time
        seq_info.count = seq_info.count + 1

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

    def iter_metrics_info(self) -> Iterator[Tuple[str, Context, 'Run']]:
        """Iterator for all run metrics info.

        Yields:
            tuples of (name, context, run) where run is the Run object itself and
            name, context defines Metric type sequence (with values of `float` and `int`).
        """
        yield from self.iter_sequence_info_by_type(('float', 'int'))

    def iter_sequence_info_by_type(self, dtypes: Union[str, Tuple[str, ...]]) -> Iterator[Tuple[str, Context, 'Run']]:
        """Iterator for run sequence infos for the given object data types

        Args:
             dtypes: The objects data types list.

        Yields:
            tuples of (name, context, run) where run is the Run object itself and name, context defines sequence for
            one of `dtypes` types.
        """
        if isinstance(dtypes, str):
            dtypes = (dtypes,)
        for ctx_idx, run_ctx_dict in self.meta_run_tree.subtree('traces').items():
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
            name: str,
            context: Context
    ) -> Optional['Metric']:
        """Retrieve metric sequence by it's name and context.

        Args:
             name (str): Tracked metric name.
             context (:obj:`Context`): Tracking context.

        Returns:
            :obj:`Metric` object if exists, `None` otherwise.
        """
        return self._get_sequence('metric', name, context)

    def get_image_sequence(
            self,
            name: str,
            context: Context
    ) -> Optional['Images']:
        """Retrieve images sequence by it's name and context.

        Args:
             name (str): Tracked image sequence name.
             context (:obj:`Context`): Tracking context.

        Returns:
            :obj:`Images` object if exists, `None` otherwise.
        """
        return self._get_sequence('images', name, context)

    def get_distribution_sequence(
            self,
            name: str,
            context: Context
    ) -> Optional['Distributions']:
        """Retrieve distributions sequence by it's name and context.

        Args:
             name (str): Tracked distribution sequence name.
             context (:obj:`Context`): Tracking context.

        Returns:
            :obj:`Distributions` object if exists, `None` otherwise.
        """
        return self._get_sequence('distributions', name, context)

    def _get_sequence_dtype(
            self,
            sequence_name: str,
            context: Context
    ) -> str:
        try:
            return self.meta_run_tree.subtree(('traces', hash(context), sequence_name, 'dtype')).collect()
        except KeyError:
            # fallback to `float`, cause in older versions there was no `dtype`
            return 'float'

    def _get_sequence(
            self,
            seq_type: str,
            sequence_name: str,
            context: Context
    ) -> Optional[Sequence]:
        seq_cls = Sequence.registry.get(seq_type, None)
        if seq_cls is None:
            raise ValueError(f'\'{seq_type}\' is not a valid Sequence')
        assert issubclass(seq_cls, Sequence)
        tracked_dtype = self._get_sequence_dtype(sequence_name, context)
        if tracked_dtype not in seq_cls.allowed_dtypes():
            return None
        sequence = seq_cls(sequence_name, context, self)
        return sequence if bool(sequence) else None

    def collect_sequence_info(self, sequence_types: Tuple[str, ...], skip_last_value=False) -> Dict[str, list]:
        """Retrieve Run's all sequences general overview.

        Args:
             sequence_types: Type names of sequences for which to collect name/context pairs.
             skip_last_value (:obj:`bool`, optional): Boolean flag to include tracked sequence last value in
             sequence info. False by default.

        Returns:
             :obj:`list`: list of sequence's `context`, `name` and optionally last tracked value triplets.
        """
        traces = self.meta_run_tree.subtree('traces')
        traces_overview = {}

        # build reverse map of sequence supported dtypes
        dtype_to_sequence_type_map = defaultdict(list)
        if isinstance(sequence_types, str):
            sequence_types = (sequence_types,)
        for seq_type in sequence_types:
            traces_overview[seq_type] = []
            seq_cls = Sequence.registry.get(seq_type, None)
            if seq_cls is None:
                raise ValueError(f'\'{seq_type}\' is not a valid Sequence')
            assert issubclass(seq_cls, Sequence)
            dtypes = seq_cls.allowed_dtypes()
            for dtype in dtypes:
                dtype_to_sequence_type_map[dtype].append(seq_type)

        for idx in traces.keys():
            ctx_dict = self.idx_to_ctx(idx).to_dict()
            for name, value in traces[idx].items():
                dtype = value.get('dtype', 'float')  # old sequences without dtype set are considered float sequences
                if dtype in dtype_to_sequence_type_map:
                    trace_data = {
                        'context': ctx_dict,
                        'name': name,
                    }
                    if not skip_last_value:
                        trace_data['last_value'] = value
                    for seq_type in dtype_to_sequence_type_map[dtype]:
                        traces_overview[seq_type].append(trace_data)
        return traces_overview

    def _calc_hash(self) -> int:
        # TODO maybe take read_only flag into account?
        return hash_auto((self.hash, hash(self.repo)))

    def _set_repo(self, repo):
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

    def __hash__(self) -> int:
        if self._hash is None:
            self._hash = self._calc_hash()
        return self._hash

    def close(self):
        if self._resources is None:
            return
        self._resources.close()

    @classmethod
    def track_rate_warn(cls):
        if not cls._track_warning_shown:
            # TODO [AT] add link to FAQ section in docs.
            logger.warning('Tracking task queue is almost full which might cause performance degradation. '
                           'Consider tracking at lower pace.')
            cls._track_warning_shown = True

    def finalize(self):
        if self._resources is None:
            return

        self._resources.finalize_run()

    def dataframe(
            self,
            include_props: bool = True,
            include_params: bool = True,
    ) -> 'DataFrame':
        """Get run properties and params as pandas DataFrame

        Args:
             include_props: (:obj:`int`, optional): If true, include run structured props
             include_params: (:obj:`int`, optional): If true, include run parameters
        """
        data = {
            'hash': self.hash,
        }

        if include_props:
            # TODO [GA]: Auto collect props based on StructuredRunMixin:
            #  - Exclude created_at, updated_at, finalized_at auto-populated fields
            #  - Collect list of representations in case of ModelMappedCollection's
            data['name'] = self.props.name
            data['description'] = self.props.description
            data['archived'] = self.props.archived
            data['creation_time'] = self.props.creation_time
            data['end_time'] = self.props.end_time
            data['experiment'] = self.props.experiment.name
            data['tags'] = json.dumps([t.name for t in self.props.tags])

        if include_params:
            # TODO [GA]:
            #  - Move run params collection to utility function
            #  - Remove code duplication from Metric.dataframe
            for path, val in treeutils.unfold_tree(self[...],
                                                   unfold_array=False,
                                                   depth=3):
                s = ''
                for key in path:
                    if isinstance(key, str):
                        s += f'.{key}' if len(s) else f'{key}'
                    else:
                        s += f'[{key}]'

                if isinstance(val, (tuple, list, dict)):
                    val = json.dumps(val)
                if s not in data.keys():
                    data[s] = val

        import pandas as pd
        df = pd.DataFrame(data, index=[0])
        return df
