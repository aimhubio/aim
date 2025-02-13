from typing import Tuple, Union

from aim.sdk.objects.figure import Figure
from aim.sdk.sequence import Sequence


class Figures(Sequence):
    """Class representing series of Plotly figure objects or Plotly lists."""

    @classmethod
    def allowed_dtypes(cls) -> Union[str, Tuple[str, ...]]:
        return (Figure.get_typename(),)  # need a tuple for consitancy

    @classmethod
    def sequence_name(cls) -> str:
        return 'figures'
