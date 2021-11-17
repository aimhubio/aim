from PIL.Image import Image as PILImage, open as pil_open
from io import BytesIO

from aim.storage.object import CustomObject
from aim.storage.types import BLOB


@CustomObject.alias('aim.image')
class Image(CustomObject):
    AIM_NAME = 'aim.image'

    def __init__(self, caption: str, image):
        super().__init__()

        self.caption = caption
        assert isinstance(image, PILImage)
        image_bytes_p = BytesIO()
        image.save(image_bytes_p, format='png')
        self.storage['data'] = BLOB(data=image_bytes_p.getvalue())

        self.storage['format'] = 'png'
        self.storage['width'], self.storage['height'] = image.size

    @property
    def caption(self):
        return self.storage['caption']

    @caption.setter
    def caption(self, value: str):
        self.storage['caption'] = value

    @property
    def format(self):
        return self.storage['format']

    @property
    def width(self):
        return self.storage['width']

    @property
    def height(self):
        return self.storage['height']

    @property
    def size(self):
        return self.storage['width'], self.storage['height']

    def to_pil_image(self):
        pil_img = pil_open(BytesIO(bytes(self.storage['data'])))
        assert pil_img.size == self.size
        return pil_img

    def json(self):
        return {
            'caption': self.caption,
            'format': self.format,
            'width': self.width,
            'height': self.height,
        }
