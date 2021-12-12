import io
import logging

from aim.sdk.num_utils import inst_has_typename
from aim.sdk.objects import File
from aim.sdk.objects.io import wavfile
from aim.storage.object import CustomObject

logger = logging.getLogger(__name__)


@CustomObject.alias("aim.audio")
class Audio(File):
    AIM_NAME = "aim.audio"

    # supported audio formats
    UNKNOWN = 0
    MP3 = 1
    WAV = 2
    FLAC = 3

    __audio_format_map = {
        UNKNOWN: "unknown",
        MP3: "mp3",
        WAV: "wav",
        FLAC: "flac"
    }

    def __init__(self, data, **kwargs):
        super().__init__()

        caption = kwargs.get("caption", "")
        rate = kwargs.get("rate", 22050)
        audio_format = kwargs.get("format", self.UNKNOWN)

        if inst_has_typename(data, ['ndarray.numpy']):
            # Currently, only WAV audio formats are supported for numpy
            audio_format = self.__audio_format_map[self.WAV]
            if "rate" not in kwargs:
                logger.warning(f'Parameter "rate" is not provided! Using default: {rate}')
            bs = wavfile.write(rate, data)
            data = bs
        # else: act as a regular file with enforced audio format definition by user side

        audio_format = self.__audio_format_map.get(audio_format)
        if not audio_format:
            raise ValueError('Invalid audio format is provided.')

        if not isinstance(data, io.IOBase):
            raise TypeError('Content is not a byte-stream object')

        self._prepare(data, caption=caption, format=audio_format)

    def _prepare(self, buffer, **extra):
        for k, v in extra.items():
            self.storage[k] = v
        self.storage['source'] = 'audio'
        self.set(buffer)

    def to_numpy(self):
        """
        This method converts WAV to Numpy array.
        Other audio formats are not supported at this moment.
        """

        assert self.storage['format'] == self.__audio_format_map[self.WAV]

        return wavfile.read(self.storage[self.STORAGE_KEY])
