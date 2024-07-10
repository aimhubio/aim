from typing import Tuple, Union

from aim.sdk.objects.text import Text
from aim.sdk.sequence import MediaSequenceBase


class Texts(MediaSequenceBase):
    """Class representing series of Text objects."""

    @classmethod
    def allowed_dtypes(cls) -> Union[str, Tuple[str, ...]]:
        text_typename = Text.get_typename()
        return text_typename, f'list({text_typename})'

    @classmethod
    def sequence_name(cls) -> str:
        return 'texts'
