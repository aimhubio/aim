import io
import logging

from aim.sdk.num_utils import inst_has_typename
from aim.sdk.objects.io import wavfile
from aim.storage.object import CustomObject
from aim.storage.types import BLOB

logger = logging.getLogger(__name__)


@CustomObject.alias('aim.audio')
class Audio(CustomObject):
    AIM_NAME = 'aim.audio'

    # supported audio formats
    UNKNOWN = 0
    MP3 = 1
    WAV = 2
    FLAC = 3

    __audio_format_map = {
        UNKNOWN: 'unknown',
        MP3: 'mp3',
        WAV: 'wav',
        FLAC: 'flac'
    }

    def __init__(self, data, **kwargs):
        super().__init__()

        caption = kwargs.get('caption', '')
        rate = kwargs.get('rate', 22050)
        audio_format = kwargs.get('format', self.UNKNOWN)

        if inst_has_typename(data, ['ndarray.numpy']):
            # Currently, only WAV audio formats are supported for numpy
            audio_format = self.__audio_format_map[self.WAV]
            if 'rate' not in kwargs:
                logger.warning(f'Parameter "rate" is not provided! Using default: {rate}')
            bs = wavfile.write(rate, data)
            data = bs
        else:
            # act as a regular file with enforced audio format definition by user side
            audio_format = self.__audio_format_map.get(audio_format)
            if not audio_format:
                raise ValueError('Invalid audio format is provided.')

        if not isinstance(data, io.BytesIO):
            raise TypeError('Content is not a byte-stream object')

        self._prepare(data, caption=caption, format=audio_format)

    def _prepare(self, buffer, **extra):
        assert isinstance(buffer, io.BytesIO)

        for k, v in extra.items():
            self.storage[k] = v
        self.storage['source'] = 'audio'
        self.storage['bytes'] = BLOB(data=buffer.read())
        self.storage['size'] = self.bytes_to_readable(buffer.getbuffer().nbytes)

    def to_numpy(self):
        """
        This method converts WAV to Numpy array.
        Other audio formats are not supported at this moment.
        """
        assert self.storage['format'] == self.__audio_format_map[self.WAV]

        return wavfile.read(self.get())

    @staticmethod
    def bytes_to_readable(num, suffix='B'):
        """
        Helper method to convert bytes to human-readable format
        """
        for unit in ('', 'K', 'M', 'G', 'T', 'P', 'E', 'Z'):
            if abs(num) < 1024.0:
                return f'{num:3.1f}{unit}{suffix}'
            num /= 1024.0
        return f'{num:.1f}Y{suffix}'

    def get(self) -> io.BytesIO:
        bs = self.storage.get('bytes')
        if not bs:
            return io.BytesIO()
        return io.BytesIO(bytes(bs))

    def dump(self, path):
        """
        Method to write inner storage content to the provided file path
        """
        assert isinstance(path, str)

        with open(path, 'wb') as FS:
            FS.write(self.get().read())
