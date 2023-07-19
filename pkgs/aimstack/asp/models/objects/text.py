from aim import Object
from aim._sdk.blob import BLOB


@Object.alias('aim.Text')
@Object.alias('aim.text')
class Text(Object):
    """Text object used to store text objects in Aim repository.

        Args:
             text (:obj:): str object used to construct `aim.Text`.
        """

    AIM_NAME = 'aim.Text'
    RESOLVE_BLOBS = True

    def __init__(self, text):
        super().__init__()

        if not isinstance(text, str):
            raise TypeError('`text` must be a string.')

        self.storage['data'] = BLOB(data=text)

    def json(self):
        return {}

    @property
    def data(self):
        return self.storage['data'].load()

    def __repr__(self):
        return self.data
