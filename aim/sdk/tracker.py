import datetime
import os
import logging
from collections import defaultdict
from copy import deepcopy
from typing import Dict, Tuple, TYPE_CHECKING

import pytz

from aim.sdk.configs import AIM_ENABLE_TRACKING_THREAD
from aim.sdk.num_utils import is_number, convert_to_py_number
from aim.sdk.utils import get_object_typename, check_types_compatibility

from aim.storage.hashing import hash_auto
from aim.storage.context import Context
from aim.storage.object import CustomObject
from aim.storage.types import AimObject

if TYPE_CHECKING:
    from aim.sdk import Run

logger = logging.getLogger(__name__)

STEP_HASH_FUNCTIONS = {
    1: lambda s: s,
    2: lambda s: hash_auto(s)
}


class SequenceInfo:
    def __init__(self):
        self.initialized = False
        self.count = None
        self.dtype = None
        self.max = None
        self.min = None
        self.version = None
        self.val_view = None
        self.step_view = None
        self.epoch_view = None
        self.time_view = None
        self.record_max_length = None
        self.step_hash_fn = None


Selector = Tuple[int, str]


class RunTracker:
    _idx_to_ctx: Dict[int, Context] = dict()
    _track_warning_shown = False

    @classmethod
    def track_rate_warn(cls):
        if not cls._track_warning_shown:
            # TODO [AT] add link to FAQ section in docs.
            logger.warning('Tracking task queue is almost full which might cause performance degradation. '
                           'Consider tracking at lower pace.')
            cls._track_warning_shown = True

    def __init__(self, run: 'Run'):
        self.meta_tree = run.meta_tree
        self.read_only = run.read_only
        self.contexts: Dict[Context, int] = dict()

        if not self.read_only:
            # remote tracking creates dedicated thread for tracking, so don't need to create another one here
            self._non_blocking = os.getenv(AIM_ENABLE_TRACKING_THREAD, False) and not run.repo.is_remote_repo

            self.hash = run.hash
            self.repo = run.repo
            self.meta_run_tree = run.meta_run_tree
            self.series_run_trees = run.series_run_trees
            self.sequence_infos: Dict[Selector, SequenceInfo] = defaultdict(SequenceInfo)

            self._preload_sequence_infos()

    def idx_to_ctx(self, idx):
        ctx = RunTracker._idx_to_ctx.get(idx)
        if ctx is not None:
            return ctx
        ctx = Context(self.meta_tree['contexts', idx])
        RunTracker._idx_to_ctx[idx] = ctx
        self.contexts[ctx] = idx
        return ctx

    def __call__(
        self,
        value,
        name: str = None,
        step: int = None,
        epoch: int = None,
        *,
        context: AimObject = None,
    ):
        assert not self.read_only
        # since worker might be lagging behind, we want to log the timestamp of run.track() call,
        # not the actual implementation execution time.
        track_time = datetime.datetime.now(pytz.utc).timestamp()

        if self._non_blocking:
            val = deepcopy(value)
            self.repo.tracking_queue.register_task(
                self._track, val, track_time, name, step, epoch, context=context) or self.track_rate_warn()
        else:
            self._track(value, track_time, name, step, epoch, context=context)

    def _track(
        self,
        value,
        track_time: float,
        name: str = None,
        step: int = None,
        epoch: int = None,
        *,
        context: AimObject = None,
    ):
        if context is None:
            context = {}

        values = self._normalized_values(value, name)
        with self.repo.atomic_track(self.hash):
            ctx = Context(context)
            for name, val in values.items():
                seq_info = self.sequence_infos[ctx.idx, name]
                if not seq_info.initialized:
                    self._init_sequence_info(ctx.idx, name, val)
                step = step if step is not None else seq_info.count

                self._update_context_data(ctx)
                self._update_sequence_info(ctx.idx, name, val, step)
                self._add_value(seq_info, val, step, epoch, track_time)

    def _preload_sequence_infos(self):
        for ctx_id, traces in self.meta_run_tree.get('traces', {}).items():
            for name in traces:
                try:
                    self._load_sequence_info(ctx_id, name)
                except KeyError:
                    pass

    def _load_sequence_info(self, ctx_id: int, name: str):
        # Creates SequenceInfo for the given context and name.
        # It is assumed that there should be at least one tracked value, otherwise the context/name pair
        #  should not appear on Run traces list. Hence it is OK to check the value type and separate metric
        #  sequences from other object sequences.

        seq_info = self.sequence_infos[(ctx_id, name)]
        assert not seq_info.initialized

        try:
            seq_info.version = self.meta_run_tree['traces', ctx_id, name, 'version']
        except KeyError:
            self.meta_run_tree['traces', ctx_id, name, 'version'] = seq_info.dtype = 1
        try:
            seq_info.dtype = self.meta_run_tree['traces', ctx_id, name, 'dtype']
        except KeyError:
            self.meta_run_tree['traces', ctx_id, name, 'dtype'] = seq_info.dtype = 'float'
        seq_info.step_hash_fn = STEP_HASH_FUNCTIONS[seq_info.version]

        series_tree = self.series_run_trees[seq_info.version]
        if seq_info.version == 2:
            seq_info.step_view = series_tree.subtree((ctx_id, name)).array('step', dtype='int64')
            try:
                seq_info.max = self.meta_run_tree['traces', ctx_id, name, 'max']
            except KeyError:
                seq_info.max = float('-inf')
            try:
                seq_info.min = self.meta_run_tree['traces', ctx_id, name, 'min']
            except KeyError:
                seq_info.min = float('inf')
        seq_info.val_view = series_tree.subtree((ctx_id, name)).array('val')
        seq_info.epoch_view = series_tree.subtree((ctx_id, name)).array('epoch', dtype='int64')
        seq_info.time_view = series_tree.subtree((ctx_id, name)).array('time', dtype='int64')
        seq_info.count = self.meta_run_tree['traces', ctx_id, name, 'last_step'] + 1
        seq_info.record_max_length = self.meta_run_tree.get(('traces', ctx_id, name, 'record_max_length'), 0)

        seq_info.initialized = True

    def _init_sequence_info(self, ctx_id: int, name: str, val):
        # this method is used in the `run.track()`, so please use only write-only instructions
        seq_info = self.sequence_infos[ctx_id, name]
        assert not seq_info.initialized

        # new SequenceInfo, initialize
        # the subtree().array().allocate() method is write-only
        seq_info.count = 0
        seq_info.record_max_length = 0
        seq_info.dtype = None
        seq_info.version = 2 if get_object_typename(val) in ('int', 'float') else 1
        seq_info.step_hash_fn = STEP_HASH_FUNCTIONS[seq_info.version]

        series_tree = self.series_run_trees[seq_info.version]
        if seq_info.version == 2:
            seq_info.step_view = series_tree.subtree((ctx_id, name)).array('step', dtype='int64').allocate()
            seq_info.max = float('-inf')
            seq_info.min = float('inf')
        seq_info.val_view = series_tree.subtree((ctx_id, name)).array('val').allocate()
        seq_info.epoch_view = series_tree.subtree((ctx_id, name)).array('epoch', dtype='int64').allocate()
        seq_info.time_view = series_tree.subtree((ctx_id, name)).array('time', dtype='int64').allocate()
        seq_info.initialized = True
        return seq_info

    def _update_sequence_info(self, ctx_id: int, name: str, val, step: int):
        # this method is used in the `run.track()`, so please use only write-only instructions
        seq_info = self.sequence_infos[ctx_id, name]
        assert seq_info.initialized

        dtype = get_object_typename(val)

        if seq_info.dtype is not None:
            def update_trace_dtype(old_dtype: str, new_dtype: str):
                logger.warning(f'Updating sequence \'{name}\' data type from {old_dtype} to {new_dtype}.')
                self.meta_tree['traces_types', new_dtype, ctx_id, name] = 1
                self.meta_run_tree['traces', ctx_id, name, 'dtype'] = new_dtype
                seq_info.dtype = new_dtype

            compatible = check_types_compatibility(dtype, seq_info.dtype, update_trace_dtype)
            if not compatible:
                raise ValueError(f'Cannot log value \'{val}\' on sequence \'{name}\'. Incompatible data types.')

        if seq_info.count == 0:
            self.meta_tree['traces_types', dtype, ctx_id, name] = 1
            self.meta_run_tree['traces', ctx_id, name, 'dtype'] = dtype
            self.meta_run_tree['traces', ctx_id, name, 'version'] = seq_info.version
            self.meta_run_tree['traces', ctx_id, name, 'first'] = val
            self.meta_run_tree['traces', ctx_id, name, 'first_step'] = step
            seq_info.dtype = dtype

        if step >= seq_info.count:
            self.meta_run_tree['traces', ctx_id, name, 'last'] = val
            self.meta_run_tree['traces', ctx_id, name, 'last_step'] = step
            seq_info.count = step + 1

        if seq_info.version == 2:
            # min/max is supported only for metrics
            if val > seq_info.max:
                self.meta_run_tree['traces', ctx_id, name, 'max'] = val
                seq_info.max = val
            if val < seq_info.min:
                self.meta_run_tree['traces', ctx_id, name, 'min'] = val
                seq_info.min = val
        if isinstance(val, (tuple, list)):
            record_max_length = max(seq_info.record_max_length, len(val))
            self.meta_run_tree['traces', ctx_id, name, 'record_max_length'] = record_max_length
            seq_info.record_max_length = record_max_length

    def _update_context_data(self, ctx: Context):
        if ctx not in self.contexts:
            self.meta_tree['contexts', ctx.idx] = ctx.to_dict()
            self.meta_run_tree['contexts', ctx.idx] = ctx.to_dict()
            self.contexts[ctx] = ctx.idx
            self._idx_to_ctx[ctx.idx] = ctx

    def _add_value(self, seq_info, val, step, epoch, track_time):
        step_hash = seq_info.step_hash_fn(step)
        seq_info.val_view[step_hash] = val
        seq_info.epoch_view[step_hash] = epoch
        seq_info.time_view[step_hash] = track_time
        if seq_info.step_view is not None:
            seq_info.step_view[step_hash] = step

    @staticmethod
    def _normalized_values(value, name):
        def _normalize_single_value(val):
            if is_number(val):
                return convert_to_py_number(val)
            elif isinstance(val, (CustomObject, list, tuple)):
                return val
            else:
                raise ValueError(f'Input type {type(value)} is neither python number nor AimObject')

        if isinstance(value, dict):
            if name is not None:
                raise ValueError('\'name\' should be None when tracking values dictionary.')
            return {str(k): _normalize_single_value(v) for k, v in value.items()}
        else:
            if name is None:
                raise ValueError('\'name\' should not be None.')
            return {name: _normalize_single_value(value)}
