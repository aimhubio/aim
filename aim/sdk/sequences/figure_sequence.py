from typing import Union, Tuple

from aim.sdk.sequence import Sequence
from aim.sdk.objects.figure import Figure


class Figures(Sequence):
    """Class representing series of Plotly figure objects or Plotly lists."""

    @classmethod
    def allowed_dtypes(cls) -> Union[str, Tuple[str, ...]]:
        return (Figure.get_typename(),)  # noqa : need a tuple for consitancy

    @classmethod
    def sequence_name(cls) -> str:
        return "figures"

    def first_step(self):
        """Get sequence tracked first step.

        Required to implement ranged and sliced data fetching.
        """
        return self._meta_tree["first_step"]

    def last_step(self):
        """Get sequence tracked last step.

        Required to implement ranged and sliced data fetching.
        """
        return self._meta_tree["last_step"]
