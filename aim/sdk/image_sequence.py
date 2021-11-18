from typing import Union, Tuple

from aim.sdk.sequence import Sequence
from aim.sdk.objects.image import Image


class Images(Sequence):
    @classmethod
    def allowed_dtypes(cls) -> Union[str, Tuple[str, ...]]:
        image_typename = Image.get_typename()
        return image_typename, f'list({image_typename})'

    @classmethod
    def sequence_name(cls) -> str:
        return 'images'

    def first_step(self):
        return self._meta_tree['first_step']

    def last_step(self):
        return self._meta_tree['last_step']

    def record_length(self):
        return self._meta_tree.get('record_max_length', None)
