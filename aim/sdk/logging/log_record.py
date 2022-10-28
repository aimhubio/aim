import time

from typing import Optional, Union, Tuple

from aim.storage.object import CustomObject
from aim.sdk.sequence import Sequence


@CustomObject.alias('aim.log_record')
class LogRecord(CustomObject):
    AIM_NAME = 'aim.log_record'

    def __init__(self, message: str, level: int, timestamp: Optional[float] = None, **kwargs):
        super().__init__()
        self.storage['message'] = message
        self.storage['log_level'] = level
        self.storage['timestamp'] = timestamp or time.time()
        for k, v in kwargs:
            self.storage['extra_args'].set(k, v, strict=False)

    @property
    def message(self):
        return self.storage['message']

    @property
    def level(self):
        return self.storage['log_level']


class LogRecords(Sequence):
    """Class representing series of LogLine objects."""

    @classmethod
    def allowed_dtypes(cls) -> Union[str, Tuple[str, ...]]:
        text_typename = LogRecord.get_typename()
        return text_typename

    @classmethod
    def sequence_name(cls) -> str:
        return 'log_records'
