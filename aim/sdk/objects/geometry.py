import io
import logging
import os.path

from aim.sdk.num_utils import inst_has_typename
from aim.storage.object import CustomObject
from aim.storage.types import BLOB

logger = logging.getLogger(__name__)


@CustomObject.alias('aim.geometry')
class Geometry(CustomObject):
    """Geometry object used to store geometry objects in Aim repository..

    Currently, geometry formats are limited to mp3, wav, flac

    Args:
         data: file path, bytes, io.BaseIO or numpy.array (only for WAV)
         format (:obj:`str`): Format of the geometry source
         rate (:obj:`int`): Rate of the geometry file, for WAV defaults to 22500
         caption (:obj:`str`, optional): Optional geometry caption. '' by default.
    """

    AIM_NAME = 'aim.geometry'

    # supported geo formats
    UNKNOWN = ''
    STL = 'stl'
    OBJ = 'obj'

    geometry_formats = (STL, OBJ)

    def __init__(self, data, format: str = '', caption: str = '', rate: int = None):
        super().__init__()

        geometry_format = format.lower()

        # act as a regular file with enforced geometry format definition by user side
        if not geometry_format:
            raise ValueError('Geometry format must be provided.')
        elif geometry_format not in self.geometry_formats:
            raise ValueError(f'Invalid geometry format is provided. Must be one of {self.geometry_formats}')

        if isinstance(data, str):
            if not os.path.exists(data) or not os.path.isfile(data):
                raise ValueError('Invalid geometry file path')
            with open(data, 'rb') as FS:
                data = FS.read()
        elif isinstance(data, io.BytesIO):
            data = data.read()

        if not isinstance(data, bytes):
            raise TypeError('Content is not a byte-stream object')

        extra = {
            'caption': caption,
            'format': geometry_format
        }
        self._prepare(data, **extra)

    def json(self):
        """Dump geometry metadata to a dict"""
        return {
            'caption': self.storage['caption'],
            'format': self.storage['format']
        }

    def _prepare(self, data, **extra) -> None:
        assert isinstance(data, bytes)

        for k, v in extra.items():
            self.storage[k] = v
        self.storage['data'] = BLOB(data=data)

    def get(self) -> io.BytesIO:
        """
        Reads data from the inner container and writes it to a buffer

        Returns: io.BytesIO
        """
        bs = self.storage.get('data')
        if not bs:
            return io.BytesIO()
        return io.BytesIO(bytes(bs))
