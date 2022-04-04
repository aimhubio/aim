from aim.sdk.objects.blob_utils import create_blob
from aim.storage.object import CustomObject


@CustomObject.alias('aim.text')
class Text(CustomObject):
    """Text object used to store text objects in Aim repository.

        Args:
             text (:obj:): str object used to construct `aim.Text`.
        """

    AIM_NAME = 'aim.text'

    def __init__(self, text):
        super().__init__()

        if not isinstance(text, str):
            raise TypeError('`text` must be a string.')

        self.storage['data'] = create_blob(data=text, object_class='text')

    def json(self):
        return {}

    @property
    def data(self):
        return self.storage['data'].load()

    def __repr__(self):
        return f'<aim.Text={repr(self.data)}>'
