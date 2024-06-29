import logging
import time

from inspect import currentframe, getframeinfo
from typing import Optional, Tuple, Union

from aim.sdk.sequence import Sequence
from aim.storage.hashing import hash_auto
from aim.storage.object import CustomObject


@CustomObject.alias('aim.log_record')
class LogRecord(CustomObject):
    AIM_NAME = 'aim.log_record'

    def __init__(
        self,
        message: str,
        level: int,
        timestamp: Optional[float] = None,
        logger_info: Optional[Tuple[str, int]] = None,
        **kwargs,
    ):
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
            'args': self.storage.get('extra_args', None),
        }

    def __hash__(self):
        return hash_auto((self.storage['__logger_info'], self.storage['log_level']))


class LogRecords(Sequence):
    """Class representing series of LogLine objects."""

    @classmethod
    def allowed_dtypes(cls) -> Union[str, Tuple[str, ...]]:
        text_typename = LogRecord.get_typename()
        return text_typename

    @classmethod
    def sequence_name(cls) -> str:
        return 'log_records'
