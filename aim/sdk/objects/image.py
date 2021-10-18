import PIL

from aim.storage.object import CustomObject


@CustomObject.alias('aim.image')
class Image(CustomObject):
    AIM_NAME = 'aim.image'

    def __init__(self, caption: str, image):
        super().__init__()

        self.caption = caption
        assert isinstance(image, PIL.Image.Image)
        self.storage['data'] = image.tobytes()

        self.storage['mode'] = image.mode
        self.storage['width'], self.storage['height'] = image.size

    @property
    def caption(self):
        return self.storage['caption']

    @caption.setter
    def caption(self, value: str):
        self.storage['caption'] = value

    @property
    def width(self):
        return self.storage['width']

    @property
    def height(self):
        return self.storage['height']

    @property
    def size(self):
        self.storage['width'], self.storage['height']

    def to_pil_image(self):
        return PIL.Image.frombytes(mode=self.storage['mode'],
                                   size=(self.storage['width'], self.storage['height']),
                                   data=self.storage['data'])

    def json(self):
        return {
            'caption': self.caption,
            'width': self.width,
            'height': self.height,
        }
