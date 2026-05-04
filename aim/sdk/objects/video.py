import io
import os.path

from aim.storage.inmemorytreeview import InMemoryTreeView
from aim.storage.object import CustomObject
from aim.storage.types import BLOB


@CustomObject.alias('aim.video')
class Video(CustomObject):
    """Video object used to store video files in Aim repositories.

    Args:
         path (:obj:`str`, optional): Video file path. Path-backed videos are
             read when the run tracking worker encodes the object, which keeps
             ``run.track()`` calls cheap for large videos when async tracking is
             enabled.
         data (:obj:`bytes` or :obj:`io.BytesIO`, optional): Video bytes.
         fps (:obj:`float`, optional): Video frame rate.
         format (:obj:`str`, optional): Video format. Inferred from ``path``
             when possible. Supported formats are ``mp4``, ``m4v``, ``gif``,
             ``mov`` and ``webm``.
         caption (:obj:`str`, optional): Optional video caption. '' by default.
    """

    AIM_NAME = 'aim.video'

    MP4 = 'mp4'
    M4V = 'm4v'
    GIF = 'gif'
    MOV = 'mov'
    WEBM = 'webm'

    video_formats = (MP4, M4V, GIF, MOV, WEBM)

    def __init__(self, path: str = None, *, data=None, fps: float = None, format: str = None, caption: str = ''):
        super().__init__()

        if path is None and data is None:
            raise ValueError('Either video path or data must be provided.')

        if path is not None:
            if not os.path.exists(path) or not os.path.isfile(path):
                raise ValueError('Invalid video file path.')
            if format is None:
                format = os.path.splitext(path)[1].lower().lstrip('.')
        elif isinstance(data, io.BytesIO):
            data = data.read()

        if path is None and not isinstance(data, bytes):
            raise TypeError('Content is not a byte-stream object.')

        video_format = (format or '').lower()
        if video_format not in self.video_formats:
            raise ValueError(f'Invalid video format is provided. Must be one of {self.video_formats}')

        self.storage['caption'] = caption
        self.storage['format'] = video_format
        self.storage['fps'] = fps
        if path is not None:
            self.storage['source_path'] = os.path.abspath(path)
            self.storage['size'] = os.path.getsize(path)
        else:
            self.storage['size'] = len(data)
            self.storage['data'] = BLOB(data=data)

    @property
    def caption(self) -> str:
        return self.storage['caption']

    @property
    def format(self) -> str:
        return self.storage['format']

    @property
    def fps(self):
        return self.storage['fps']

    @property
    def size(self) -> int:
        return self.storage.get('size', 0)

    def json(self):
        """Dump video metadata to a dict."""
        return {
            'caption': self.caption,
            'format': self.format,
            'fps': self.fps,
            'size': self.size,
        }

    def __deepcopy__(self, memodict=None):
        if memodict is None:
            memodict = {}

        storage = InMemoryTreeView(container={})
        for key in ('caption', 'format', 'fps', 'size', 'source_path', 'data'):
            try:
                storage[key] = self.storage[key]
            except KeyError:
                pass
        result = self.__class__.__new__(self.__class__, _storage=storage)
        memodict[id(self)] = result
        return result

    def get(self) -> io.BytesIO:
        """Return video bytes as an in-memory buffer."""
        try:
            bs = self.storage['data']
            return io.BytesIO(bytes(bs))
        except KeyError:
            pass
        source_path = self.storage.get('source_path')
        if source_path:
            with open(source_path, 'rb') as fs:
                return io.BytesIO(fs.read())
        return io.BytesIO()

    def _aim_encode(self):
        try:
            self.storage['data']
        except KeyError:
            source_path = self.storage.get('source_path')
            if not source_path:
                raise ValueError('Video data is missing.')
            with open(source_path, 'rb') as fs:
                self.storage['data'] = BLOB(data=fs.read())
            self.storage['size'] = os.path.getsize(source_path)
        if self.storage.get('source_path'):
            del self.storage['source_path']
        return self.AIM_NAME, self.storage[...]
