import io
import logging
import os.path

from aim.sdk.num_utils import inst_has_typename
from aim.sdk.objects.io import wavfile
from aim.storage.object import CustomObject
from aim.storage.types import BLOB

logger = logging.getLogger(__name__)


@CustomObject.alias('aim.audio')
class Audio(CustomObject):
    AIM_NAME = 'aim.audio'

    # supported audio formats
    UNKNOWN = ''
    MP3 = 'mp3'
    WAV = 'wav'
    FLAC = 'flac'

    audio_formats = (MP3, WAV, FLAC)

    def __init__(self, data, **kwargs):
        super().__init__()

        caption = kwargs.get('caption', '')
        rate = kwargs.get('rate', 22050)
        audio_format = kwargs.get('format', self.UNKNOWN).lower()

        if inst_has_typename(data, ['ndarray.numpy']):
            # Currently, only WAV audio formats are supported for numpy
            audio_format = self.WAV
            if 'rate' not in kwargs:
                logger.info(f'Parameter "rate" is not provided! Using default: {rate}')
            bs = wavfile.write(rate, data)
            data = bs

        # act as a regular file with enforced audio format definition by user side
        if not audio_format:
            raise ValueError('Audio format must be provided.')
        elif audio_format not in self.audio_formats:
            raise ValueError(f'Invalid audio format is provided. Must be one of {self.audio_formats}')

        if isinstance(data, str):
            if not os.path.exists(data) or not os.path.isfile(data):
                raise ValueError('Invalid audio file path')
            with open(data, 'rb') as FS:
                data = FS.read()
        elif isinstance(data, io.BytesIO):
            data = data.read()

        if not isinstance(data, bytes):
            raise TypeError('Content is not a byte-stream object')

        self._prepare(data, caption=caption, format=audio_format)

    def _prepare(self, data, **extra):
        assert isinstance(data, bytes)

        for k, v in extra.items():
            self.storage[k] = v
        self.storage['data'] = BLOB(data=data)

    def to_numpy(self):
        """
        This method converts WAV to Numpy array.
        Other audio formats are not supported at this moment.
        """
        assert self.storage['format'] == self.__audio_format_map[self.WAV]

        return wavfile.read(self.get())

    def get(self) -> io.BytesIO:
        bs = self.storage.get('data')
        if not bs:
            return io.BytesIO()
        return io.BytesIO(bytes(bs))
