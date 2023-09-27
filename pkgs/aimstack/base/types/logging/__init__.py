import time
import logging

from inspect import getframeinfo, currentframe
from typing import Optional, Tuple

from aim._core.storage.hashing import hash_auto
from aim import Record
from aimstack.base.types.text import Text


@Record.alias('aim.log_line')
class LogLine(Text):
    AIM_NAME = 'base.LogLine'
    SEQUENCE_NAME = 'LogStream'


@Record.alias('aim.log_record')
class LogRecord(Record):
    AIM_NAME = 'base.LogRecord'
    SEQUENCE_NAME = 'LogRecordSequence'

    def __init__(self,
                 message: str,
                 level: int,
                 timestamp: Optional[float] = None,
                 logger_info: Optional[Tuple[str, int]] = None,
                 **kwargs):
        super().__init__()
        self.storage['message'] = message
        self.storage['log_level'] = level
        self.storage['timestamp'] = timestamp or time.time()
        if kwargs:
            self.storage['extra_args'] = kwargs

        if not logger_info:
            frame_info = getframeinfo(currentframe().f_back)
            logger_info = (frame_info.filename, frame_info.lineno)
        self.storage['__logger_info'] = logger_info

    @property
    def message(self):
        return self.storage['message']

    @property
    def level(self):
        return self.storage['log_level']

    def json(self):
        return {
            'message': self.message,
            'log_level': logging.getLevelName(self.level),
            'timestamp': self.storage['timestamp'],
            'args': self.storage.get('extra_args', None)
        }

    def __hash__(self):
        return hash_auto((self.storage['__logger_info'], self.storage['log_level']))
