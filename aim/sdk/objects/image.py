import logging
import os.path

from PIL import Image as PILImage

from io import BytesIO
from itertools import chain, repeat
from typing import List
import numpy as np

from aim.sdk.num_utils import inst_has_typename
from aim.storage.object import CustomObject
from aim.storage.types import BLOB

logger = logging.getLogger(__name__)


@CustomObject.alias('aim.image')
class Image(CustomObject):
    """Image object used to store image objects in Aim repository...

    Args:
         image (:obj:): pillow `Image` object or `torch.Tensor` or `numpy.array` used to construct `aim.Image`.
         caption (:obj:`str`, optional): Optional image caption. '' by default.
         format, quality, optimize: PIL image save params. For more information refer to PIL documentation.

    Example of params to reduce quality of the image:
        format='jpeg',
        optimize=True,
        quality=85
    """

    FLAG_WARN_RGBA_RGB = False
    AIM_NAME = 'aim.image'

    def __init__(self, image, caption: str = '', format='png', quality=85, optimize=False):
        super().__init__()

        params = {
            "format": format.lower(),
            "quality": quality,
            "optimize": optimize
        }

        if isinstance(image, str):
            self._from_file_path(image, params)
        elif inst_has_typename(image, ['PIL', 'Image']):
            self._from_pil_image(image, params)
        elif inst_has_typename(image, ['torch', 'Tensor']):
            self._from_torch_tensor(image, params)
        elif inst_has_typename(image, ['tensorflow', 'Tensor']):
            self._from_tf_tensor(image, params)
        elif inst_has_typename(image, ['numpy', 'array']):
            self._from_numpy_array(image, params)
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

    def _from_pil_image(self, pil_image: PILImage.Image, params):
        assert isinstance(pil_image, PILImage.Image)
        img_container = BytesIO()

        try:
            pil_image.save(img_container, **params)
        except OSError as exc:
            # The best way to approach this problem is to prepare PIL Image object before hitting this method.
            #
            # This block only handles case where RGBA mode is mandated to save in RGB
            # PIL won't do that automatically, so we have to convert image to RGB before saving it.
            # In addition - make transparency "white" before conversion otherwise it will be black.
            if not Image.FLAG_WARN_RGBA_RGB:
                logger.warning(f"Failed to save the image due to the following error: {exc}")
                logger.warning("Attempting to convert RGBA -> RGB")
                Image.FLAG_WARN_RGBA_RGB = True

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

    def _from_file_path(self, file_path, params):
        if not os.path.isfile(file_path):
            raise ValueError('Invalid image file path.')

        return self._from_pil_image(PILImage.open(file_path), params)

    def _from_numpy_array(self, array: np.ndarray, params):
        if array.ndim not in {2, 3}:
            raise ValueError('Cannot convert to aim.Image. array must have 2/3-D shape.')

        if array.ndim == 3 and array.shape[2] == 1:  # greyscale
            pil_image = PILImage.fromarray(array[:, :, 0])
        else:
            pil_image = PILImage.fromarray(array)
        self._from_pil_image(pil_image, params)

    def _from_torch_tensor(self, tensor, params):
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
        self._from_pil_image(pil_image, params)

    def _from_tf_tensor(self, tensor, params):
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
        self._from_pil_image(pil_image, params)


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
