from typing import Tuple

from aim.sdk.objects.distribution import Distribution
from aim.sdk.sequence import Sequence


class Distributions(Sequence):
    """Class representing series of Distribution objects."""

    @classmethod
    def allowed_dtypes(cls) -> Tuple[str, ...]:
        return (Distribution.get_typename(),)

    @classmethod
    def sequence_name(cls) -> str:
        return 'distributions'
