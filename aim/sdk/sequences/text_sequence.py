from typing import Tuple

from aim.sdk.sequence import Sequence
from aim.sdk.objects.text import Text


class Texts(Sequence):
    """Class representing series of Text objects."""

    @classmethod
    def allowed_dtypes(cls) -> Tuple[str, ...]:
        return (Text.get_typename(),)

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
