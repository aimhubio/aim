import io
import logging
import os.path

from aim.core.storage.object import CustomObject
from aim.core.storage.types import BLOB

logger = logging.getLogger(__name__)


@CustomObject.alias('aim.figure3d')
class Figure3D(CustomObject):
    """Figure3D object used to store 3-dimensional objects in Aim repository..

    Currently, 3D figure formats are limited to stl and obj

    Args:
         data: file path, bytes or io.BaseIO
         format (:obj:`str`): Format of the 3D object source
         caption (:obj:`str`, optional): Optional 3D object caption. '' by default.
    """

    AIM_NAME = 'aim.figure3d'

    # supported geo formats
    UNKNOWN = ''
    STL = 'stl'
    OBJ = 'obj'

    geometry_formats = (STL, OBJ)

    def __init__(self, data, format: str = '', caption: str = ''):
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
        """Dump figure metadata to a dict"""
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
