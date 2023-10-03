import datetime
import json
import inspect
import logging

from functools import partialmethod

from aim import Container, Sequence, Property
from aim._sdk.utils import utc_timestamp
from aim._sdk import type_utils
from aimcore.callbacks import Caller
from aimcore.callbacks import events
from aim._ext.system_info import utils as system_utils
from aim._sdk.constants import ContainerOpenMode, KeyNames
from aim._sdk.num_utils import is_number

from .logging import (
    LogLine,
    LogStream,
    LogRecord,
    LogRecordSequence
)

from .metric import Metric, SystemMetric
from .image import ImageSequence
from .audio import AudioSequence
from .text import TextSequence
from .distribution import DistributionSequence
from .figures import FigureSequence, Figure3DSequence

from typing import Optional, Union, List, Tuple, Dict, Any, Type

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from aim import Repo


@type_utils.query_alias('run')
class Run(Container, Caller):
    name = Property()
    description = Property(default='')
    archived = Property(default=False)

    def __init__(self, hash_: Optional[str] = None, *,
                 repo: Optional[Union[str, 'Repo']] = None,
                 mode: Optional[Union[str, ContainerOpenMode]] = ContainerOpenMode.WRITE):
        super().__init__(hash_, repo=repo, mode=mode)

        if not self._is_readonly:
            if self.name is None:
                self.name = f'Run #{self.hash}'

    def enable_system_monitoring(self):
        if not self._is_readonly:
            self['__system_params'] = {
                'packages': system_utils.get_installed_packages(),
                'env_variables': system_utils.get_environment_variables(),
                'git_info': system_utils.get_git_info(),
                'executable': system_utils.get_executable(),
                'arguments': system_utils.get_exec_args()
            }

            self.repo.resource_tracker.register(self)
            self.repo.resource_tracker.start()

    @events.on.logs_collected
    def track_terminal_logs(self, log_lines: List[Tuple[str, int]], **kwargs):
        if self._state.get('cleanup'):
            return
        for (line, line_num) in log_lines:
            self.logs.track(LogLine(line), step=line_num + self._prev_logs_end)

    @events.on.system_resource_stats_collected
    def track_system_resources(self, stats: Dict[str, Any], context: Dict, **kwargs):
        if self._state.get('cleanup'):
            return
        for resource_name, usage in stats.items():
            self.sequences.typed_sequence(SystemMetric, resource_name, context).track(usage)

    @property
    def created_at(self) -> datetime.datetime:
        return datetime.datetime.fromtimestamp(self.creation_time, tz=datetime.timezone.utc)

    @property
    def ended_at(self) -> Optional[datetime.datetime]:
        end_time = self.end_time
        if end_time is not None:
            return datetime.datetime.fromtimestamp(end_time, tz=datetime.timezone.utc)
        else:
            return None

    @property
    def duration(self) -> float:
        end_time = self.end_time or utc_timestamp()
        return end_time - self.creation_time

    @property
    def active(self) -> bool:
        return self.end_time is None

    @property
    def logs(self) -> LogStream:
        if getattr(self, '_logs', None) is None:
            self._logs = LogStream(self, name='logs', context={})
            self._prev_logs_end = self._logs.next_step
        return self._logs

    # logging API
    def _log_message(self, level: int, msg: str, **params):
        frame_info = inspect.getframeinfo(inspect.currentframe().f_back)
        logger_info = (frame_info.filename, frame_info.lineno)
        log_record = LogRecord(msg, level, logger_info=logger_info, **params)
        self.track(log_record, name='__log_records')
        block = (level > logging.WARNING)
        self._status_reporter.check_in(flag_name="new_logs", block=block)

    log_error = partialmethod(_log_message, logging.ERROR)
    log_warning = partialmethod(_log_message, logging.WARNING)
    log_info = partialmethod(_log_message, logging.INFO)
    log_debug = partialmethod(_log_message, logging.DEBUG)

    def log_records(self) -> LogRecordSequence:
        return LogRecordSequence(self, name='__log_records', context={})

    def track(self, value, name: str, step: Optional[int] = None, context: Optional[dict] = None, **axis):
        context = {} if context is None else context
        seq_type = self._get_sequence_type_from_value(value)
        sequence = self.sequences.typed_sequence(seq_type, name, context)
        sequence.track(value, step=step, **axis)

    def get_metric(self, name: str, context: Optional[dict] = None) -> Metric:
        context = {} if context is None else context
        return self.sequences.typed_sequence(Metric, name, context)

    def get_text_sequence(self, name: str, context: Optional[dict] = None) -> TextSequence:
        context = {} if context is None else context
        return self.sequences.typed_sequence(TextSequence, name, context)

    def get_image_sequence(self, name: str, context: Optional[dict] = None) -> ImageSequence:
        context = {} if context is None else context
        return self.sequences.typed_sequence(ImageSequence, name, context)

    def get_audio_sequence(self, name: str, context: Optional[dict] = None) -> AudioSequence:
        context = {} if context is None else context
        return self.sequences.typed_sequence(AudioSequence, name, context)

    def get_distribution_sequence(self, name: str, context: Optional[dict] = None) -> DistributionSequence:
        context = {} if context is None else context
        return self.sequences.typed_sequence(DistributionSequence, name, context)

    def get_figure_sequence(self, name: str, context: Optional[dict] = None) -> FigureSequence:
        context = {} if context is None else context
        return self.sequences.typed_sequence(FigureSequence, name, context)

    def get_figure3d_sequence(self, name: str, context: Optional[dict] = None) -> Figure3DSequence:
        context = {} if context is None else context
        return self.sequences.typed_sequence(Figure3DSequence, name, context)

    def dataframe(
        self,
        include_props: bool = True,
        include_params: bool = True,
    ):
        data = {
            'hash': self.hash,
        }

        if include_props:
            # TODO [GA]: Auto collect props based on StructuredRunMixin:
            #  - Exclude created_at, updated_at, finalized_at auto-populated fields
            #  - Collect list of representations in case of ModelMappedCollection's
            data['name'] = self.name
            data['description'] = self.description
            data['archived'] = self.archived
            data['creation_time'] = self.creation_time
            data['end_time'] = self.end_time
            data['active'] = self.active
            data['duration'] = self.duration

        if include_params:
            from aim._core.storage import treeutils
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

    @staticmethod
    def _get_sequence_type_from_value(value) -> Type[Sequence]:
        val_type = type_utils.get_object_typename(value)
        if type_utils.is_allowed_type(val_type, type_utils.get_sequence_value_types(Metric)) \
                or is_number(value):
            return Metric
        if type_utils.is_allowed_type(val_type, type_utils.get_sequence_value_types(ImageSequence)):
            return ImageSequence
        if type_utils.is_allowed_type(val_type, type_utils.get_sequence_value_types(AudioSequence)):
            return AudioSequence
        if type_utils.is_allowed_type(val_type, type_utils.get_sequence_value_types(TextSequence)):
            return TextSequence
        if type_utils.is_allowed_type(val_type, type_utils.get_sequence_value_types(DistributionSequence)):
            return TextSequence
        if type_utils.is_allowed_type(val_type, type_utils.get_sequence_value_types(FigureSequence)):
            return TextSequence
        if type_utils.is_allowed_type(val_type, type_utils.get_sequence_value_types(Figure3DSequence)):
            return TextSequence
        return Sequence
