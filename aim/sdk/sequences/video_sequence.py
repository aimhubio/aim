from typing import Tuple, Union

from aim.sdk.objects import Video
from aim.sdk.sequence import MediaSequenceBase


class Videos(MediaSequenceBase):
    """Class representing series of Video objects or Video lists."""

    @classmethod
    def allowed_dtypes(cls) -> Union[str, Tuple[str, ...]]:
        typename = Video.get_typename()
        return typename, f'list({typename})'

    @classmethod
    def sequence_name(cls) -> str:
        return 'videos'
