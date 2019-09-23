import os

from torch import Tensor
from torchvision.utils import save_image


class Media:
    """
    Media object that is stored as a file
    """
    def save(self, *args, **kwargs):
        raise NotImplementedError('Method not implemented')


class Image(Media):
    def __init__(self, data):
        self._data = data

    def save(self, path):
        """
        Save image at specified path
        """

        # Create image directory if not exists
        dir_path = os.path.dirname(path)
        if not os.path.isdir(dir_path):
            os.makedirs(dir_path, exist_ok=True)

        if isinstance(self._data, Tensor):
            # Save pytorch tensor as an image
            save_image(self._data, path)
