from typing import Tuple, Union

from aim.storage.object import CustomObject
from aim.sdk.sequence import MediaSequenceBase
from aim.sdk.objects.text import Text


@CustomObject.alias('aim.log_line')
class LogLine(Text):
    AIM_NAME = 'aim.log_line'

    def __init__(self, line):
        if not isinstance(line, str):
            raise TypeError('`line` must be a string.')

        super().__init__(line)


class Logs(MediaSequenceBase):
    """Class representing series of LogLine objects."""

    @classmethod
    def allowed_dtypes(cls) -> Union[str, Tuple[str, ...]]:
        text_typename = LogLine.get_typename()
        return text_typename

    @classmethod
    def sequence_name(cls) -> str:
        return 'logs'
