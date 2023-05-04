from typing import Union, Tuple

from aim.sdk.sequence import MediaSequenceBase
from aim.sdk.objects.geometry import Geometry


class Geometries(MediaSequenceBase):
    """Class representing series of Geometry objects or Geometry lists."""

    @classmethod
    def allowed_dtypes(cls) -> Union[str, Tuple[str, ...]]:
        return Geometry.get_typename(),

    @classmethod
    def sequence_name(cls) -> str:
        return 'geometries'
