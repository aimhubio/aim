from typing import Union, Tuple

from aim.sdk.sequence import Sequence
from aim.sdk.objects import Audio


class Audios(Sequence):
    """Class representing series of Audio objects or Audio lists."""

    @classmethod
    def allowed_dtypes(cls) -> Union[str, Tuple[str, ...]]:
        typename = Audio.get_typename()
        return typename, f'list({typename})'

    @classmethod
    def sequence_name(cls) -> str:
        return 'audios'

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
        """Get tracked records longest list length or `None` if Audio objects are tracked.

        Required to implement ranged and sliced data fetching.
        """
        return self._meta_tree.get('record_max_length', None)
