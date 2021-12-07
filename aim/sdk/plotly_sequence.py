from typing import Union, Tuple

from aim.sdk.sequence import Sequence
from aim.sdk.objects.plotly import Plotly


class Figures(Sequence):
    """Class representing series of Plotly figure objects or Plotly lists."""

    @classmethod
    def allowed_dtypes(cls) -> Union[str, Tuple[str, ...]]:
        plotly_typename = Plotly.get_typename()
        return plotly_typename, f'list({plotly_typename})'

    @classmethod
    def sequence_name(cls) -> str:
        return 'figures'

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
