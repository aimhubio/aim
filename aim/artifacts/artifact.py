from typing import Tuple, Optional
from abc import ABCMeta, abstractmethod
import time
import re

from aim.artifacts.record import Record, RecordCollection
from aim.artifacts.proto.base_pb2 import BaseRecord

Writable = [Record, RecordCollection]


class Artifact(metaclass=ABCMeta):
    """
    Base class for all serializable artifacts
    """
    # List of binary artifact which are processed differently
    IMAGE = 'image'
    MODEL = 'model'
    PROTOBUF = 'protobuf'
    JSON = 'JSON'

    _step_counter = {}

    @staticmethod
    def validate_name(name: str) -> bool:
        if re.search('^[A-z0-9_\-]+$', str(name)) is None:
            return False
        return True

    def __init__(self, cat: tuple):
        self.cat = cat
        self.step = 0

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

    def initialize_step_counter(self, step: int, name: str,
                                meta: Optional[Tuple] = None,
                                session_id: Optional[int] = None):
        """
        Initializes the step counter if step number is not given
        """
        if step is not None:
            self.step = step
        else:
            key = name
            if meta is not None:
                key = (key,) + meta

            if session_id is None:
                session_id = 0

            self._step_counter.setdefault(session_id, {})
            self._step_counter[session_id].setdefault(self.cat, {})
            self._step_counter[session_id][self.cat].setdefault(key, 0)
            self.step = self._step_counter[session_id][self.cat][key]
            self._step_counter[session_id][self.cat][key] += 1

    def serialize_pb_object(self, artifact, step: int = None,
                            epoch: int = None) -> bytes:
        base_pb = BaseRecord()
        base_pb.step = step
        base_pb.timestamp = int(time.time())
        base_pb.artifact = artifact.SerializeToString()
        if epoch is not None:
            base_pb.epoch = epoch
            base_pb.has_epoch = True
        else:
            base_pb.has_epoch = False
        base_bytes = base_pb.SerializeToString()

        return base_bytes

    def get_inst_unique_name(self):
        """
        Returns unique name for an artifact instance. Is useful when the same
        type of artifact need to be distributed across files
        """
        return self.name if hasattr(self, 'name') else None
