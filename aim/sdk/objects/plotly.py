from aim.sdk.num_utils import inst_has_typename
from aim.storage.object import CustomObject
from aim.storage.types import BLOB


@CustomObject.alias('aim.plotly')
class Plotly(CustomObject):
    AIM_NAME = 'aim.plotly'

    def __init__(self, obj):
        super().__init__()

        if inst_has_typename(obj, ['Figure', 'BaseFigure']):
            self._prepare(obj)
        else:
            raise TypeError(f'Object is not a Plotly instance')

    def _prepare(self, obj):
        assert hasattr(obj, "to_json")

        self.storage["data"] = BLOB(data=obj.to_json())

    def json(self):
        blob_data = self.storage["data"]
        return blob_data.data

    def to_figure(self):
        try:
            from plotly.io import from_json
        except ModuleNotFoundError:
            raise ModuleNotFoundError("Could not find plotly in the installed modules.")

        return from_json(self.json())
