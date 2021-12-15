from typing import Tuple, Union

from aim.sdk.sequence import Sequence
from aim.sdk.objects.text import Text


class Texts(Sequence):
    """Class representing series of Text objects."""

    @classmethod
    def allowed_dtypes(cls) -> Union[str, Tuple[str, ...]]:
        text_typename = Text.get_typename()
        return text_typename, f'list({text_typename})'

    @classmethod
    def sequence_name(cls) -> str:
        return 'texts'

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
        """Get tracked records longest list length or `None` if Text objects are tracked.

        Required to implement ranged and sliced data fetching.
        """
        return self._meta_tree.get('record_max_length', None)
