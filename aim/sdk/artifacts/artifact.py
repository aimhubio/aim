from abc import ABCMeta, abstractmethod
import time

from aim.sdk.artifacts.record import Record, RecordCollection
from aim.sdk.artifacts.proto.base_pb2 import BaseRecord

Writable = [Record, RecordCollection]


class Artifact(metaclass=ABCMeta):
    """
    Base class for all serializable artifacts
    """
    # List of binary artifact which are processed differently
    IMAGE = 'image'
    MODEL = 'model'
    PROTOBUF = 'protobuf'

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
        Saves additional binary objects (blobs) which cannot be processed
        by default ArtifactWriter
        """
        ...

    def serialize_pb_object(self, artifact, step: int = None,
                            epoch: int = None) -> bytes:
        base_pb = BaseRecord()
        base_pb.step = step
        base_pb.timestamp = int(time.time())
        base_pb.artifact = artifact.SerializeToString()
        base_pb.epoch = epoch
        base_bytes = base_pb.SerializeToString()

        return base_bytes
