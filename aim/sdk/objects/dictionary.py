import numpy as np

from typing import Tuple

from aim.storage.object import CustomObject
from aim.storage.types import BLOB

from aim.sdk.utils import dotdict
import json

@CustomObject.alias('aim.dictionary')
class Dictionary(CustomObject):
    """Dictionary object used to store pythonic dict objects in Aim repository.

    Args:
         dictionary (:obj: `dict`): pythonic dictionary instance
    """

    AIM_NAME = 'aim.dictionary'

    def __init__(self, dictionary):
        super().__init__()

        if not isinstance(dictionary, dict):
            raise TypeError('`dictionary` must be a pythonic dictionary.')

        dictionary = dotdict(dictionary)
        dictionary = json.dumps(dictionary, indent=2).encode('utf-8')
        self.storage['dictionary'] = dictionary


    def dict(self):
        """Dump dictionary metadata to a dict"""
        return dotdict(json.loads(self.storage['dictionary']))
