from typing import Tuple, Union

from aim.sdk.objects import Audio
from aim.sdk.sequence import MediaSequenceBase


class Audios(MediaSequenceBase):
    """Class representing series of Audio objects or Audio lists."""

    @classmethod
    def allowed_dtypes(cls) -> Union[str, Tuple[str, ...]]:
        typename = Audio.get_typename()
        return typename, f'list({typename})'

    @classmethod
    def sequence_name(cls) -> str:
        return 'audios'
