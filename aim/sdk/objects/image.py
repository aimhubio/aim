import logging
import os.path

from PIL import (
    Image as PILImage,
    ImageSequence as PILImageSequence
)

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
         format (:obj:`str`, optional): Parameter for PIL's .save() method. 'png' by default.
         quality (:obj:`int`, optional): Parameter for PIL's .save() method. 90 by default.
         optimize (:obj:`bool`, optional): Parameter for PIL's .save() method. False by default.

         For more information on the format, quality and optimize parameters, refer to PIL documentation.

    Example of params to reduce quality of the image:
        format='jpeg',
        optimize=True,
        quality=85
    """

    DEFAULT_IMG_FORMAT = 'png'
    FLAG_WARN_RGBA_RGB = False
    AIM_NAME = 'aim.image'

    def __init__(self, image, caption: str = '', format=None, quality=90, optimize=False):
        super().__init__()

        params = {
            'format': format,
            'quality': quality,
            'optimize': optimize
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
        elif inst_has_typename(image, ['Figure', 'matplotlib', 'figure']):
            self._from_matplotlib_figure(image, params)
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

        if not params['format']:
            params['format'] = pil_image.format or self.DEFAULT_IMG_FORMAT
        else:
            # normalize img format
            img_format = params['format'].lower()
            if img_format == 'jpg':
                # PIL doesn't support 'jpg' key
                params['format'] = 'jpeg'
            params['format'] = img_format

        if getattr(pil_image, "n_frames", 1) > 1:
            # is animated
            frames = PILImageSequence.all_frames(pil_image)
            params.update(
                dict(
                    save_all=True,
                    append_images=frames[1:],
                )
            )
            frames[0].save(
                img_container,
                **params
            )
        else:
            try:
                pil_image.save(img_container, **params)
            except OSError as exc:
                # The best way to approach this problem is to prepare PIL Image object before hitting this method.
                # This block only handles case where RGBA/P/LA/PA mode is mandated to save in RGB
                # PIL won't do that automatically, so we have to convert image to RGB before saving it.
                # In addition - make transparency "white" before conversion otherwise it will be black.
                if pil_image.mode not in ('RGBA', 'LA', 'PA', 'P'):
                    raise exc
                elif not Image.FLAG_WARN_RGBA_RGB:
                    logger.warning(f'Failed to save the image due to the following error: {exc}')
                    logger.warning(f'Attempting to convert mode "{pil_image.mode}" to "RGB"')
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
        array: np.ndarray = tensor.cpu().numpy()

        if array.ndim == 3:
            channels = array.shape[0]
            if channels == 1:
                pil_image = PILImage.fromarray(array[0, :, :])
            else:
                # reverse order of channels: c,h,w => h,w,c
                pil_image = PILImage.fromarray(np.transpose(array, (1, 2, 0)))
        else:
            pil_image = PILImage.fromarray(array)
        self._from_pil_image(pil_image, params)

    def _from_tf_tensor(self, tensor, params):
        try:
            import tensorflow as tf
            assert isinstance(tensor, tf.Tensor)
        except (ImportError, AssertionError):
            raise ValueError('Cannot convert from tf.Tensor')

        if tensor.ndim not in {2, 3}:
            raise ValueError('Cannot convert to aim.Image. Tensor must have 2/3-D shape.')

        if tensor.dtype.is_floating:
            tensor = tf.cast(tf.math.scalar_mul(255.0, tensor), tf.uint8)
        array: np.ndarray = tensor.numpy()

        if array.ndim == 3 and array.shape[2] == 1:  # greyscale
            pil_image = PILImage.fromarray(array[:, :, 0])
        else:
            pil_image = PILImage.fromarray(array)
        self._from_pil_image(pil_image, params)

    def _from_matplotlib_figure(self, figure, params):
        try:
            assert hasattr(figure, 'savefig')
        except AssertionError:
            raise ValueError('Cannot convert from matplotlib figure.')

        buffer = BytesIO()
        figure.savefig(buffer)
        buffer.seek(0)

        return self._from_pil_image(PILImage.open(buffer), params)

    def __eq__(self, other):
        if not isinstance(other, Image):
            return False

        props = ['mode', 'format', 'width', 'height']
        for p in props:
            if self.storage[p] != other.storage[p]:
                return False

        return self.storage['data'].load() == other.storage['data'].load()


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
