from typing import Union, Tuple

from aim.sdk.sequence import MediaSequenceBase
from aim.sdk.objects.figure3d import Figure3D


class Figures3D(MediaSequenceBase):
    """Class representing series of Figure3D objects."""

    @classmethod
    def allowed_dtypes(cls) -> Union[str, Tuple[str, ...]]:
        return Figure3D.get_typename(),

    @classmethod
    def sequence_name(cls) -> str:
        return 'figures3d'
