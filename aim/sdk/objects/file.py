import io

from aim.storage.object import CustomObject
from aim.storage.types import BLOB


@CustomObject.alias('aim.file')
class File(CustomObject):
    """
    File object used to store binary objects in Aim repository.
    """

    AIM_NAME = 'aim.file'
    STORAGE_KEY = 'bytes'

    def __init__(self, bs=None):
        """
        Args:
            bs: Tracked byte stream - should be instanceof BytesIO
        """
        super().__init__()

        if bs is not None:
            self.set(bs)

    @staticmethod
    def bytes_to_readable(num, suffix="B"):
        """
        Helper method to convert bytes to human-readable format
        """
        for unit in ("", "K", "M", "G", "T", "P", "E", "Z"):
            if abs(num) < 1024.0:
                return f"{num:3.1f}{unit}{suffix}"
            num /= 1024.0
        return f"{num:.1f}Y{suffix}"

    def get(self) -> io.BytesIO:
        bs = self.storage.get(self.STORAGE_KEY)
        if not bs:
            return io.BytesIO()
        return io.BytesIO(bytes(bs))

    def set(self, bs: io.BytesIO) -> None:
        assert isinstance(bs, io.BytesIO)

        self.storage[self.STORAGE_KEY] = BLOB(data=bs.read())
        self.storage["size"] = self.bytes_to_readable(bs.getbuffer().nbytes)

    def read_from(self, path):
        """
        Method to read content from file path and store into inner storage
        """
        assert isinstance(path, str)

        with open(path, 'rb') as FS:
            buffer = io.BytesIO(FS.read())
        return self.set(buffer)

    def write_to(self, path):
        """
        Method to write inner storage content to the provided file path
        """
        assert isinstance(path, str)

        with open(path, 'wb') as FS:
            FS.write(self.get().read())
