from abc import ABCMeta
import time

from aim.sdk.artifacts import Record
from aim.sdk.artifacts.artifact import Artifact
from aim.sdk.artifacts.proto.text_pb2 import TextRecord


class Text(Artifact, metaclass=ABCMeta):
    cat = ('text',)

    def __init__(self, name: str, text: str, epoch: int = None, step: int = None):
        self.name = name
        self.text = text
        self.timestamp = int(time.time())
        self.epoch = epoch or 0

        super(Text, self).__init__(self.cat)
        self.initialize_step_counter(step, self.name)

    def __str__(self):
        return '{document_name}: {text}'.format(document_name=self.name,
                                                text=self.text)

    def serialize(self) -> Record:
        text_pb = TextRecord()
        text_pb.text = self.text

        data_bytes = self.serialize_pb_object(text_pb, self.step, self.epoch)

        return Record(
            name=self.name,
            cat=self.cat,
            content=data_bytes,
            binary_type=self.PROTOBUF
        )

    def save_blobs(self, name: str, abs_path: str = None):
        pass
