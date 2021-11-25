from typing import Tuple

from aim.sdk.sequence import Sequence
from aim.sdk.objects.distribution import Distribution


class Distributions(Sequence):
    """Class representing series of Image objects or Image lists."""

    @classmethod
    def allowed_dtypes(cls) -> Tuple[str, ...]:
        return (Distribution.get_typename(),)

    @classmethod
    def sequence_name(cls) -> str:
        return 'distributions'

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
