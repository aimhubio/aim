import io
import logging
import os.path

from aim import Record
from aim._sdk.num_utils import inst_has_typename
from aim._sdk.blob import BLOB


logger = logging.getLogger(__name__)


@Record.alias('aim.figure')
class Figure(Record):
    """
    Figure object can be used for storing Plotly or Matplotlib figures into Aim repository.
    Core functionality is based on Plotly.

    Args:
         obj (:obj:): plotly or matplotlib figure object.
    """

    AIM_NAME = 'base.Figure'
    RESOLVE_BLOBS = False
    SEQUENCE_NAME = 'FigureSequence'

    def __init__(self, obj):
        super().__init__()

        if inst_has_typename(obj, ['matplotlib', 'Figure']):
            self._from_matplotlib_figure(obj)
        elif inst_has_typename(obj, ['plotly', 'Figure', 'BaseFigure']):
            self._prepare(obj)
        else:
            raise TypeError('Object is not a Plotly Figure instance')

    def _prepare(self, obj):
        try:
            from plotly.version import __version__ as plotly_version
        except ModuleNotFoundError:
            plotly_version = 'unknown'

        assert hasattr(obj, 'to_json')

        self.storage['source'] = 'plotly'
        self.storage['version'] = plotly_version
        self.storage['format'] = 'raw_json'
        self.storage['data'] = BLOB(data=obj.to_json())

    @property
    def data(self):
        return self.storage['data'].load()

    def _from_matplotlib_figure(self, obj):
        try:
            from plotly.tools import mpl_to_plotly
        except ModuleNotFoundError:
            raise ModuleNotFoundError('Plotly is required to track matplotlib figure.')

        try:
            logger.warning('Tracking a matplotlib object using "aim.Figure" might not behave as expected.'
                           'In such cases, consider tracking with "aim.Image".')
            for ax in obj.axes:
                for collection in ax.collections:
                    if not hasattr(collection, "get_offset_position"):
                        collection.get_offset_position = matplotlib_get_offset_position.__get__(collection)
            plotly_obj = mpl_to_plotly(obj)
        except ValueError as err:
            raise ValueError(f'Failed to convert matplotlib figure to plotly figure: {err}')

        return self._prepare(plotly_obj)

    def json(self):
        """Dump figure metadata to a dict"""
        return {
            'source': self.storage['source'],
            'format': self.storage['format'],
            'version': self.storage['version']
        }

    def to_plotly_figure(self):
        try:
            from plotly.io import from_json
        except ModuleNotFoundError:
            raise ModuleNotFoundError('Could not find plotly in the installed modules.')

        return from_json(self.data)


class Figure3D(Record):
    """Figure3D object used to store 3-dimensional objects in Aim repository..

    Currently, 3D figure formats are limited to stl and obj

    Args:
         data: file path, bytes or io.BaseIO
         format (:obj:`str`): Format of the 3D object source
         caption (:obj:`str`, optional): Optional 3D object caption. '' by default.
    """

    AIM_NAME = 'base.Figure3d'
    RESOLVE_BLOBS = False
    SEQUENCE_NAME = 'Figure3DSequence'

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


def matplotlib_get_offset_position(self):
    # self._offset_position is depricated
    # using 'screen' as the default value
    return 'screen'
