from typing import Tuple, Union

from aim.sdk.objects.image import Image
from aim.sdk.sequence import MediaSequenceBase


class Images(MediaSequenceBase):
    """Class representing series of Image objects or Image lists."""

    @classmethod
    def allowed_dtypes(cls) -> Union[str, Tuple[str, ...]]:
        image_typename = Image.get_typename()
        return image_typename, f'list({image_typename})'

    @classmethod
    def sequence_name(cls) -> str:
        return 'images'
