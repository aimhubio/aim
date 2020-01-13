from abc import ABCMeta, abstractmethod
from typing import Any

from aim.sdk.artifacts.serializable import Serializable
from aim.engine.utils import get_module


class Media(Serializable, metaclass=ABCMeta):
    cat = ('media',)

    def __init__(self, media_data: Any):
        self.path = None
        self.abs_path = None
        self.media_data = media_data

        super(Media, self).__init__(self.cat)

    def serialize(self):
        serialized = {
            self.get_type(): {
                'cat': self.cat,
            },
        }

        return serialized

    @abstractmethod
    def get_type(self) -> str:
        """
        Returns content type from Serializer in which
        instance content should be saved
        """
        ...

    @abstractmethod
    def save_media(self, path: str, abs_path: str) -> bool:
        """
        Stores media at the specified path
        """
        ...


class Image(Media):
    cat = ('media', 'images')

    def get_type(self) -> str:
        return self.IMAGE

    def save_media(self, path: str, abs_path: str) -> bool:
        """
        Saves image at specified path
        """
        self.path = path
        self.abs_path = abs_path
        if type(self.media_data).__name__ == 'Tensor':
            torchvision_utils = get_module('torchvision.utils')

            # Save pytorch tensor as an image
            torchvision_utils.save_image(self.media_data, abs_path)

            return True

        return False
