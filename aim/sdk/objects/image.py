from PIL.Image import Image as PILImage, open as pil_open
from io import BytesIO

from aim.storage.object import CustomObject
from aim.storage.types import BLOB


@CustomObject.alias('aim.image')
class Image(CustomObject):
    """Image object used to store image objects in Aim repository..

    Args:
         image (:obj:`PIL.Image`): pillow `Image` object used to construct `aim.Image`.
         caption (:obj:`str`, optional): Optional image caption. '' by default.
    """

    AIM_NAME = 'aim.image'

    def __init__(self, image: PILImage, caption: str = ''):
        super().__init__()

        self.caption = caption
        assert isinstance(image, PILImage)
        image_bytes_p = BytesIO()
        image.save(image_bytes_p, format='png')
        self.storage['data'] = BLOB(data=image_bytes_p.getvalue())

        self.storage['type'] = 'PIL.Image'
        self.storage['mode'] = image.mode
        self.storage['format'] = 'png'
        self.storage['width'], self.storage['height'] = image.size

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

    def to_pil_image(self) -> PILImage:
        """Method to convert aim.Image to pillow Image"""

        pil_img = pil_open(BytesIO(bytes(self.storage['data'])))
        assert pil_img.size == self.size
        return pil_img

    @classmethod
    def from_pil_image(cls, pil_image: PILImage):
        """Named constructor for aim Image"""
        assert isinstance(pil_image, PILImage)
        return Image(image=pil_image)

    def json(self):
        """Dump image metadata to a dict"""
        return {
            'caption': self.caption,
            'format': self.format,
            'width': self.width,
            'height': self.height,
        }


def convert_to_aim_image(obj):
    if isinstance(obj, PILImage):
        return Image.from_pil_image(obj)
    # TODO support other sources as well
    raise ValueError
