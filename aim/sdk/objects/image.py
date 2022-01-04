import os.path

from PIL import Image as PILImage

from io import BytesIO
from itertools import chain, repeat
from typing import List, Dict
import numpy as np

from aim.sdk.num_utils import inst_has_typename
from aim.storage.object import CustomObject
from aim.storage.types import BLOB


@CustomObject.alias('aim.image')
class Image(CustomObject):
    """Image object used to store image objects in Aim repository..

    Args:
         image (:obj:): pillow `Image` object or `torch.Tensor` or `numpy.array` used to construct `aim.Image`.
         caption (:obj:`str`, optional): Optional image caption. '' by default.
         save_params (:obj:`dict`, optional): Dictionary that will be applied upon saving PIL image.

    Example of "save_params" to reduce quality of the image (Refer to PIL documentation for the list of parameters):
    save_params = {
        'format': 'jpeg',
        'optimize': True,
        'quality': 80
    }
    """

    AIM_NAME = 'aim.image'

    def __init__(self, image, caption: str = '', save_params: Dict = None):
        super().__init__()

        if save_params is None:
            save_params = {}

        if isinstance(image, str):
            self._from_file_path(image, save_params)
        elif inst_has_typename(image, ['PIL', 'Image']):
            self._from_pil_image(image, save_params)
        elif inst_has_typename(image, ['torch', 'Tensor']):
            self._from_torch_tensor(image, save_params)
        elif inst_has_typename(image, ['tensorflow', 'Tensor']):
            self._from_tf_tensor(image, save_params)
        elif inst_has_typename(image, ['numpy', 'array']):
            self._from_numpy_array(image, save_params)
        else:
            raise TypeError(f'Cannot convert to aim.Image. Unsupported type {type(image)}.')
        self.caption = caption

    @property
    def caption(self) -> str:
        """Image caption, set by user.

            :getter: Returns image caption.
            :setter: Sets image caption.
            :type: string
        """
        return self.storage['caption']

    @caption.setter
    def caption(self, value: str):
        self.storage['caption'] = value

    @property
    def format(self) -> str:
        """Stored image format.

            :getter: Returns image format.
            :type: string
        """
        return self.storage['format']

    @property
    def width(self):
        """Stored image width.

            :getter: Returns image width.
            :type: string
        """
        return self.storage['width']

    @property
    def height(self):
        """Stored image height.

            :getter: Returns image height.
            :type: string
        """
        return self.storage['height']

    @property
    def size(self):
        """Stored image size.

            :getter: Returns image (width, height) pair.
            :type: string
        """
        return self.storage['width'], self.storage['height']

    def to_pil_image(self) -> PILImage.Image:
        """Method to convert aim.Image to pillow Image"""
        pil_img = PILImage.open(BytesIO(bytes(self.storage['data'])))
        assert pil_img.size == self.size
        return pil_img

    def json(self):
        """Dump image metadata to a dict"""
        return {
            'caption': self.caption,
            'format': self.format,
            'width': self.width,
            'height': self.height,
        }

    def _from_pil_image(self, pil_image: PILImage.Image, save_params):
        assert isinstance(pil_image, PILImage.Image)
        img_container = BytesIO()

        # By default, format is PNG but can be replaced trough save_params
        params = {
            'format': 'png',
            **save_params
        }

        try:
            pil_image.save(img_container, **params)
        except OSError:
            """
            The best way to approach this problem is to prepare PIL Image object before hitting this method.
            
            This block only handles case where RGBA mode is mandated to save in RGB
            PIL wont do that automatically so we have to convert image to RGB before saving it.
            In addition - make transparency "white" before conversion otherwise it will be black.
            """
            alpha = pil_image.convert('RGBA').split()[-1]  # Get only alpha
            background = PILImage.new('RGBA', pil_image.size, (255, 255, 255, 255))
            background.paste(pil_image, mask=alpha)
            pil_image = background.convert('RGB')

            # Retry
            pil_image.save(img_container, **params)

        self.storage['data'] = BLOB(data=img_container.getvalue())
        self.storage['source'] = 'PIL.Image'
        self.storage['mode'] = pil_image.mode
        self.storage['format'] = params['format']
        self.storage['width'], self.storage['height'] = pil_image.size

    def _from_file_path(self, file_path, save_params):
        if not os.path.isfile(file_path):
            raise ValueError('Invalid image file path.')

        return self._from_pil_image(PILImage.open(file_path), save_params)

    def _from_numpy_array(self, array: np.ndarray, save_params):
        if array.ndim not in {2, 3}:
            raise ValueError('Cannot convert to aim.Image. array must have 2/3-D shape.')

        if array.ndim == 3 and array.shape[2] == 1:  # greyscale
            pil_image = PILImage.fromarray(array[:, :, 0])
        else:
            pil_image = PILImage.fromarray(array)
        self._from_pil_image(pil_image, save_params)

    def _from_torch_tensor(self, tensor, save_params):
        try:
            import torch
            assert isinstance(tensor, torch.Tensor)
        except (ImportError, AssertionError):
            raise ValueError('Cannot convert from torch.Tensor')

        if tensor.ndim not in {2, 3}:
            raise ValueError('Cannot convert to aim.Image. Tensor must have 2/3-D shape.')
        if tensor.is_floating_point():
            tensor = tensor.mul(255).byte()
        array: np.ndarray = np.transpose(tensor.cpu().numpy(), (1, 2, 0))

        if array.ndim == 3 and array.shape[2] == 1:  # greyscale
            pil_image = PILImage.fromarray(array[:, :, 0])
        else:
            pil_image = PILImage.fromarray(array)
        self._from_pil_image(pil_image, save_params)

    def _from_tf_tensor(self, tensor, save_params):
        try:
            import tensorflow as tf
            assert isinstance(tensor, tf.Tensor)
        except (ImportError, AssertionError):
            raise ValueError('Cannot convert from torch.Tensor')

        if tensor.ndim not in {2, 3}:
            raise ValueError('Cannot convert to aim.Image. Tensor must have 2/3-D shape.')
        # TODO check the logic below

        if tensor.dtype.is_floating:
            tensor = tf.cast(tf.math.scalar_mul(255.0, tensor), tf.dtypes.int8)
        array: np.ndarray = tensor.numpy()

        if array.ndim == 3 and array.shape[2] == 1:  # greyscale
            pil_image = PILImage.fromarray(array[:, :, 0])
        else:
            pil_image = PILImage.fromarray(array)
        self._from_pil_image(pil_image, save_params)


def convert_to_aim_image_list(images, labels=None) -> List[Image]:
    aim_images = []
    if labels is not None:
        labels_it = chain(labels, repeat(''))
    else:
        labels_it = repeat('')
    for img, lbl in zip(images, labels_it):
        aim_img = Image(img, lbl if isinstance(lbl, str) else str(lbl.item()))
        aim_images.append(aim_img)
    return aim_images
