from abc import ABCMeta, abstractmethod

from aim.sdk.artifacts.record import Record, RecordCollection

Writable = [Record, RecordCollection]


class Artifact(metaclass=ABCMeta):
    """
    Base class for all serializable artifacts
    """
    # List of binary artifact which are processed differently
    IMAGE = 'image'
    MODEL = 'model'

    # List of available file extensions
    LOG_EXT = 'log'

    def __init__(self, cat: tuple):
        self.cat = cat

    @abstractmethod
    def serialize(self) -> Writable:
        """
        Serializes instance to a Record or RecordCollection and describes
        files, directories and/or archives that should be created
        to store an instance into .aim repo
        """
        ...

    @abstractmethod
    def save_blobs(self, name: str, abs_path: str = None):
        """
        Saves additional binary objects (blobs) which are cannot be processed by default ArtifactWriter
        """
        ...
