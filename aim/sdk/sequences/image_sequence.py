from typing import Union, Tuple

from aim.sdk.sequence import Sequence
from aim.sdk.objects.image import Image


class Images(Sequence):
    """Class representing series of Image objects or Image lists."""

    @classmethod
    def allowed_dtypes(cls) -> Union[str, Tuple[str, ...]]:
        image_typename = Image.get_typename()
        return image_typename, f'list({image_typename})'

    @classmethod
    def sequence_name(cls) -> str:
        return 'images'

    def first_step(self):
        """Get sequence tracked first step.

        Required to implement ranged and sliced data fetching.
        """
        return self._meta_tree['first_step']

    def last_step(self):
        """Get sequence tracked last step.

        Required to implement ranged and sliced data fetching.
        """
        return self._meta_tree['last_step']

    def record_length(self):
        """Get tracked records longest list length or `None` if Image objects are tracked.

        Required to implement ranged and sliced data fetching.
        """
        return self._meta_tree.get('record_max_length', None)
