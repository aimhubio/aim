import datetime
import json
import logging
import os
import pathlib
import sys

from collections import defaultdict
from functools import partialmethod
from inspect import currentframe, getframeinfo
from typing import TYPE_CHECKING, Any, Dict, Iterator, Optional, Tuple, Union

import pytz

from aim.ext.cleanup import AutoClean
from aim.ext.exception_resistant import noexcept
from aim.ext.resource import DEFAULT_SYSTEM_TRACKING_INT, ResourceTracker
from aim.ext.utils import (
    get_environment_variables,
    get_git_info,
    get_installed_packages,
)
from aim.sdk.base_run import BaseRun
from aim.sdk.logging import LogRecord, LogRecords
from aim.sdk.objects.artifact import Artifact
from aim.sdk.remote_run_reporter import RemoteFileManager, RemoteRunHeartbeatReporter
from aim.sdk.reporter import RunStatusReporter, ScheduledStatusReporter
from aim.sdk.reporter.file_manager import LocalFileManager
from aim.sdk.sequence import Sequence
from aim.sdk.sequence_collection import SingleRunSequenceCollection
from aim.sdk.tracker import RunTracker
from aim.sdk.types import AimObject
from aim.sdk.utils import (
    backup_run,
)
from aim.storage import treeutils
from aim.storage.context import Context
from aim.storage.treeview import TreeView


if TYPE_CHECKING:
    from aim.ext.resource.log import Logs
    from aim.sdk.repo import Repo
    from aim.sdk.sequence_collection import SequenceCollection
    from aim.sdk.sequences.audio_sequence import Audios
    from aim.sdk.sequences.distribution_sequence import Distributions
    from aim.sdk.sequences.figure_sequence import Figures
    from aim.sdk.sequences.image_sequence import Images
    from aim.sdk.sequences.metric import Metric
    from aim.sdk.sequences.text_sequence import Texts
    from pandas import DataFrame

logger = logging.getLogger(__name__)


class BasicRunAutoClean(AutoClean['BasicRun']):
    PRIORITY = 90

    def __init__(self, instance: 'Run') -> None:
        """
        Prepare the `Run` for automatic cleanup.

        Args:
            instance: The `Run` instance to be cleaned up.
        """
        super().__init__(instance)

        self.read_only = instance.read_only
        self.hash = instance.hash
        self.meta_run_tree = instance.meta_run_tree
        self.repo = instance.repo

        self.extra_resources = []

        self._tracker = instance._tracker
        self._checkins = instance._checkins
        self._heartbeat = instance._heartbeat
        self._lock = instance._lock

    def add_extra_resource(self, resource) -> None:
        self.extra_resources.append(resource)

    def finalize_run(self):
        """
        Finalize the run by indexing all the data.
        """
        self.meta_run_tree['end_time'] = datetime.datetime.now(pytz.utc).timestamp()

    def empty_rpc_queue(self):
        if self.repo.is_remote_repo:
            self.repo._client.get_queue().wait_for_finish()

    def _close(self) -> None:
        """
        Close the `Run` instance resources and trigger indexing.
        """
        if self.read_only:
            logger.debug(f'Run {self.hash} is read-only, skipping cleanup')
            return
        for res in reversed(self.extra_resources):
            logger.debug(f'Closing resource {res}')
            res.close()

        self.empty_rpc_queue()
        self.finalize_run()
        if self._heartbeat is not None:
            self._heartbeat.stop()
        if self._checkins is not None:
            self._checkins.close()
        if self._lock:
            self._lock.release()


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
    def creation_time(self):
        """Run object creation time [UTC] as timestamp.

        :getter: Returns run creation time.
        """
        return self.props.creation_time

    @property
    def created_at(self):
        if self.repo.is_remote_repo:
            return datetime.datetime.fromtimestamp(self.creation_time, tz=pytz.utc).replace(tzinfo=None)
        else:
            return self.props.created_at

    @property
    def finalized_at(self):
        if self.end_time:
            return datetime.datetime.fromtimestamp(self.end_time, tz=pytz.utc).replace(tzinfo=None)
        else:
            return None

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
    def duration(self):
        """Run duration in seconds (end_time - creation_time)

        :getter: Returns run duration.
        """
        if self.end_time:
            return self.end_time - self.creation_time
        else:
            from aim.web.api.utils import datetime_now

            return datetime_now().timestamp() - self.creation_time

    @property
    def active(self):
        """Check if run is active or not.

        :getter: Returns run's active state.
        :type: bool
        """

        if self.end_time:
            return False
        else:
            return True

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
            value (:obj:`str`): Tag to add.
        """
        return self.props.add_tag(value)

    def remove_tag(self, tag_name):
        """Remove run tag.

        Args:
            tag_name (:obj:`str`): :obj:`name` of tag to be removed.
        """
        return self.props.remove_tag(tag_name)


class BasicRun(BaseRun, StructuredRunMixin):
    _metric_version_warning_shown = False

    def __init__(
        self,
        run_hash: Optional[str] = None,
        *,
        repo: Optional[Union[str, 'Repo', pathlib.Path]] = None,
        read_only: bool = False,
        experiment: Optional[str] = None,
        force_resume: bool = False,
    ):
        self._resources: Optional[BasicRunAutoClean] = None
        super().__init__(run_hash, repo=repo, read_only=read_only, force_resume=force_resume)

        self.meta_attrs_tree: TreeView = self.meta_tree.subtree('attrs')
        self.meta_run_attrs_tree: TreeView = self.meta_run_tree.subtree('attrs')

        if not read_only:
            logger.debug(f'Opening Run {self.hash} in write mode')

            if self.check_metrics_version():
                if self.repo.is_remote_repo:
                    logger.warning(
                        f'Cannot track Run with remote repo {self.repo.path}. Please upgrade repo first '
                        f'with the following command:'
                    )
                    logger.warning(f"aim storage --repo {self.repo.path} upgrade 3.11+ '*'")
                    raise RuntimeError
                else:
                    logger.warning(f'Detected sub-optimal format metrics for Run {self.hash}. Upgrading...')
                    backup_path = backup_run(self)
                    try:
                        self.update_metrics()
                        logger.warning(f'Successfully converted Run {self.hash}')
                        logger.warning(
                            f'Run backup can be found at {backup_path}. '
                            f'In case of any issues the following command can be used to restore data: '
                            f'`aim storage --repo {self.repo.root_path} restore {self.hash}`'
                        )
                    except Exception as e:
                        logger.error(f'Failed to convert metrics. {e}')
                        logger.warning(
                            f'Run backup can be found at {backup_path}. '
                            f'To restore data please run the following command: '
                            f'`aim storage --repo {self.repo.root_path} restore {self.hash}`'
                        )
                        raise

        self._props = None
        self._checkins = None
        self._heartbeat = None

        if not read_only:
            if not self.repo.is_remote_repo:
                self._checkins = RunStatusReporter(self.hash, LocalFileManager(self.repo.path))
                progress_flag_path = pathlib.Path(self.repo.path) / 'meta' / 'progress' / self.hash
                self._heartbeat = ScheduledStatusReporter(self._checkins, touch_path=progress_flag_path)
            else:
                self._checkins = RunStatusReporter(self.hash, RemoteFileManager(self.repo._client, self.hash))
                self._heartbeat = RemoteRunHeartbeatReporter(self.repo._client, self.hash)

            try:
                self.meta_run_attrs_tree.first_key()
            except (KeyError, StopIteration):
                # no run params are set. use empty dict
                self[...] = {}
            self.meta_run_tree['end_time'] = None
            self.props
        if experiment:
            self.experiment = experiment

        self._run_artifacts_uri: str = None
        self._tracker = RunTracker(self)
        self._resources = BasicRunAutoClean(self)

    def __hash__(self) -> int:
        return super().__hash__()

    def idx_to_ctx(self, idx: int) -> Context:
        return self._tracker.idx_to_ctx(idx)

    @noexcept
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

    @noexcept
    def set(self, key, val: Any, strict: bool = True):
        self.meta_run_attrs_tree.set(key, val, strict)
        self.meta_attrs_tree.set(key, val, strict)

    def get(self, key, default: Any = None, strict: bool = True, resolve_objects=False):
        try:
            return self._collect(key, strict=strict, resolve_objects=resolve_objects)
        except KeyError:
            return default

    def _collect(self, key, strict: bool = True, resolve_objects: bool = False):
        return self.meta_run_attrs_tree.collect(key, strict=strict, resolve_objects=resolve_objects)

    def __delitem__(self, key: str):
        """Remove key from run meta-params.
        Args:
            key: meta-parameter path
        """
        del self.meta_attrs_tree[key]
        del self.meta_run_attrs_tree[key]

    @noexcept
    def track(
        self,
        value,
        name: str = None,
        step: int = None,
        epoch: int = None,
        *,
        context: AimObject = None,
    ):
        """Main method for tracking numeric value series and object series.

        Args:
             value: The tracked value.
             name (:obj:`str`): Tracked sequence name.
             step (:obj:`int`, optional): Sequence tracking iteration. Auto-incremented if not specified.
             epoch (:obj:`int`, optional): The training epoch.
             context (:obj:`dict`, optional): Sequence tracking context.

        Appends the tracked value to sequence specified by `name` and `context`.
        Appended values should be of the same type, in other words, sequence is a homogeneous collection.
        """

        self._tracker(value, name, step, epoch, context=context)

    # artifacts logging API
    @property
    def artifacts_uri(self) -> str:
        if self._run_artifacts_uri is None:
            base_uri = self.meta_run_tree.get('artifacts_uri', None)
            self._run_artifacts_uri = os.path.join(base_uri, self.hash)
        return self._run_artifacts_uri

    def set_artifacts_uri(self, uri: str):
        self.meta_run_tree['artifacts_uri'] = uri
        self._run_artifacts_uri = os.path.join(uri, self.hash)

    @noexcept
    def log_artifact(self, path: str, name: Optional[str] = None, *, block: bool = False):
        artifact = Artifact(path, uri=self.artifacts_uri, name=name)
        artifact.upload(block=block)
        self.meta_run_tree.subtree('artifacts')[artifact.name] = artifact

    @noexcept
    def log_artifacts(self, path: str, name: Optional[str] = None, *, block: bool = False):
        dir_path = pathlib.Path(path)
        if name is None:
            name = dir_path.name
        for file_path in dir_path.glob('**/*'):
            if file_path.is_file():
                rel_path = file_path.relative_to(dir_path)
                artifact = Artifact(path=str(file_path), uri=self.artifacts_uri, name=f'{name}/{rel_path}')
                artifact.upload(block=block)
                self.meta_run_tree.subtree('artifacts')[artifact.name] = artifact

    @property
    def artifacts(self) -> Dict[str, Artifact]:
        return self.meta_run_tree.get('artifacts', {})

    # logging API
    def _log_message(self, level: int, msg: str, **params):
        frame_info = getframeinfo(currentframe().f_back)
        logger_info = (frame_info.filename, frame_info.lineno)
        self.track(LogRecord(msg, level, logger_info=logger_info, **params), name='__log_records')
        block = level > logging.WARNING
        self._checkins.check_in(flag_name='new_logs', block=block)

    log_error = partialmethod(_log_message, logging.ERROR)
    log_warning = partialmethod(_log_message, logging.WARNING)
    log_info = partialmethod(_log_message, logging.INFO)
    log_debug = partialmethod(_log_message, logging.DEBUG)

    def get_log_records(self) -> Optional[LogRecords]:
        """Retrieve duplicated terminal logs for a run

        Returns:
            :obj:`Sequence` object if exists, `None` otherwise.
        """
        return self._get_sequence('log_records', '__log_records', Context({}))

    @property
    def props(self):
        if self._props is None:
            self._props = self.repo.request_props(self.hash, self.read_only)
        return self._props

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
        from aim.sdk.sequences.metric import Metric

        self.repo._prepare_runs_cache()
        return SingleRunSequenceCollection(self, seq_cls=Metric)

    def __eq__(self, other: 'Run') -> bool:
        return self.hash == other.hash and self.repo == other.repo

    def get_metric(self, name: str, context: Context) -> Optional['Metric']:
        """Retrieve metric sequence by it's name and context.

        Args:
             name (:obj:`str`): Tracked metric name.
             context (:obj:`Context`): Tracking context.

        Returns:
            :obj:`Metric` object if exists, `None` otherwise.
        """
        if self.read_only and not Run._metric_version_warning_shown:
            if self.check_metrics_version():
                logger.warning(
                    f'Detected sub-optimal format metrics for Run {self.hash}. Consider upgrading repo '
                    f'to improve queries performance:'
                )
                logger.warning(f"aim storage --repo {self.repo.path} upgrade 3.11+ '*'")
                Run._metric_version_warning_shown = True

        return self._get_sequence('metric', name, context)

    def get_image_sequence(self, name: str, context: Context) -> Optional['Images']:
        """Retrieve images sequence by it's name and context.

        Args:
             name (:obj:`str`): Tracked image sequence name.
             context (:obj:`Context`): Tracking context.

        Returns:
            :obj:`Images` object if exists, `None` otherwise.
        """
        return self._get_sequence('images', name, context)

    def get_figure_sequence(self, name: str, context: Context) -> Optional['Figures']:
        """Retrieve figure sequence by its name and context.

        Args:
             name (:obj:`str`): Tracked figure sequence name.
             context (:obj:`Context`): Tracking context.

        Returns:
            :obj:`Figures` object if exists, `None` otherwise.
        """
        return self._get_sequence('figures', name, context)

    def get_audio_sequence(self, name: str, context: Context) -> Optional['Audios']:
        """Retrieve audios sequence by its name and context.

        Args:
             name (:obj:`str`): Tracked audios sequence name.
             context (:obj:`Context`): Tracking context.

        Returns:
            :obj:`Audios` object if exists, `None` otherwise.
        """
        return self._get_sequence('audios', name, context)

    def get_distribution_sequence(self, name: str, context: Context) -> Optional['Distributions']:
        """Retrieve distributions sequence by it's name and context.

        Args:
             name (:obj:`str`): Tracked distribution sequence name.
             context (:obj:`Context`): Tracking context.

        Returns:
            :obj:`Distributions` object if exists, `None` otherwise.
        """
        return self._get_sequence('distributions', name, context)

    def get_terminal_logs(self) -> Optional['Logs']:
        """Retrieve duplicated terminal logs for a run

        Returns:
            :obj:`Logs` object if exists, `None` otherwise.
        """
        return self._get_sequence('logs', 'logs', Context({}))

    def get_text_sequence(self, name: str, context: Context) -> Optional['Texts']:
        """Retrieve texts sequence by it's name and context.

        Args:
             name (:obj:`str`): Tracked text sequence name.
             context (:obj:`Context`): Tracking context.

        Returns:
            :obj:`Texts` object if exists, `None` otherwise.
        """
        return self._get_sequence('texts', name, context)

    def _get_sequence_dtype(self, sequence_name: str, context: Context) -> str:
        try:
            return self.meta_run_tree.subtree(('traces', hash(context), sequence_name, 'dtype')).collect()
        except KeyError:
            # fallback to `float`, cause in older versions there was no `dtype`
            return 'float'

    def _get_sequence(self, seq_type: str, sequence_name: str, context: Context) -> Optional[Sequence]:
        seq_cls = Sequence.registry.get(seq_type, None)
        if seq_cls is None:
            raise ValueError(f"'{seq_type}' is not a valid Sequence")
        assert issubclass(seq_cls, Sequence)
        tracked_dtype = self._get_sequence_dtype(sequence_name, context)
        if tracked_dtype not in seq_cls.allowed_dtypes():
            return None
        sequence = seq_cls(sequence_name, context, self)
        return sequence if bool(sequence) else None

    def collect_sequence_info(
        self, sequence_types: Union[str, Tuple[str, ...]], skip_last_value=False
    ) -> Dict[str, list]:
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
                raise ValueError(f"'{seq_type}' is not a valid Sequence")
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
                        trace_data['values'] = value
                    for seq_type in dtype_to_sequence_type_map[dtype]:
                        traces_overview[seq_type].append(trace_data)
        return traces_overview

    def _cleanup_trees(self):
        del self.meta_run_attrs_tree
        del self.meta_attrs_tree
        del self.meta_run_tree
        del self.meta_tree
        del self._series_run_trees
        self.meta_run_attrs_tree = None
        self.meta_run_tree = None
        self.meta_attrs_tree = None
        self.meta_tree = None
        self._series_run_trees = None

    def close(self):
        if self._resources is None:
            return
        self._resources.close()
        self._tracker.sequence_infos.clear()
        # de-reference trees and other resources
        del self._resources
        del self._props
        self._resources = None
        self._props = None
        self._cleanup_trees()

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
            data['end_time'] = self.end_time
            data['active'] = self.active
            data['experiment'] = self.props.experiment
            data['tags'] = json.dumps(self.props.tags)

        if include_params:
            # TODO [GA]:
            #  - Move run params collection to utility function
            #  - Remove code duplication from Metric.dataframe
            for path, val in treeutils.unfold_tree(self[...], unfold_array=False, depth=3):
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

    def report_progress(
        self,
        *,
        expect_next_in: int = 0,
        block: bool = False,
    ) -> None:
        """
        Report progress for the run. Report the expected time for the next progress report.

        If no progress reports are received by the expiry date (plus the grace period), the
        run is considered as failed.

        Args:
            expect_next_in: (:obj:`int`, optional): The number of seconds to wait before the next progress report.
            block: (:obj:`bool`, optional): If true, block the thread until the report is written to filesystem.
        """
        if self._checkins is None:
            raise ValueError('Progress reports are not enabled for this run')
        self._checkins._check_in(expect_next_in=expect_next_in, block=block)

    def report_successful_finish(
        self,
        *,
        block: bool = True,
    ) -> None:
        """
        Report successful finish of the run. If the run is not marked as successfully finished,
        it can potentially be considered as failed.

        Args:
            block: (:obj:`bool`, optional): If true, block the thread until the report is written to filesystem.
        """
        if self._checkins is None:
            raise ValueError('Progress reports are not enabled for this run')
        self._checkins._report_successful_finish(block=block)


class Run(BasicRun):
    """Run object used for tracking metrics.

    Provides method :obj:`track` to track value and object series for multiple names and contexts.
    Provides dictionary-like interface for Run object meta-parameters.
    Provides API for iterating through tracked sequences.

    Args:
         run_hash (:obj:`str`, optional): Run's hash. If skipped, generated automatically.
         repo (:obj:`Union[Repo,str]`, optional): Aim repository path or Repo object to which Run object is bound.
            If skipped, default Repo is used.
         read_only (:obj:`bool`, optional): Run creation mode.
            Default is False, meaning Run object can be used to track metrics.
         experiment (:obj:`str`, optional): Sets Run's `experiment` property. 'default' if not specified.
            Can be used later to query runs/sequences.
         force_resume (:obj:`bool`, optional): Forcefully resume stalled Run.
         system_tracking_interval (:obj:`int`, optional): Sets the tracking interval in seconds for system usage
            metrics (CPU, Memory, etc.). Set to `None` to disable system metrics tracking.
         log_system_params (:obj:`bool`, optional): Enable/Disable logging of system params such as installed packages,
            git info, environment variables, etc.
    """

    @noexcept
    def __init__(
        self,
        run_hash: Optional[str] = None,
        *,
        repo: Optional[Union[str, 'Repo', pathlib.Path]] = None,
        read_only: bool = False,
        experiment: Optional[str] = None,
        force_resume: bool = False,
        system_tracking_interval: Optional[Union[int, float]] = DEFAULT_SYSTEM_TRACKING_INT,
        log_system_params: Optional[bool] = False,
        capture_terminal_logs: Optional[bool] = True,
    ):
        super().__init__(run_hash, repo=repo, read_only=read_only, experiment=experiment, force_resume=force_resume)

        self._system_resource_tracker: ResourceTracker = None
        if not read_only:
            if log_system_params:
                self['__system_params'] = {
                    'packages': get_installed_packages(),
                    'env_variables': get_environment_variables(),
                    'git_info': get_git_info(),
                    'executable': sys.executable,
                    'arguments': sys.argv,
                }

            if ResourceTracker.check_interval(system_tracking_interval) or capture_terminal_logs:
                current_logs = self.get_terminal_logs()
                log_offset = current_logs.last_step() + 1 if current_logs else 0
                self._system_resource_tracker = ResourceTracker(
                    self._tracker, system_tracking_interval, capture_terminal_logs, log_offset
                )
                self._system_resource_tracker.start()
                self._resources.add_extra_resource(self._system_resource_tracker)
