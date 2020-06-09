from typing import Optional

from aim.sdk.artifacts import Record
from aim.sdk.artifacts.artifact import Artifact
from aim.sdk.artifacts.media import Image
from aim.sdk.artifacts.proto.image_set_pb2 import ImageSetRecord


class ImageSet(Artifact):
    cat = ('image_set',)

    def __init__(self, name: str, image: Image, epoch: Optional[int] = None,
                 step: Optional[int] = None, meta: Optional[dict] = None):
        self.name = name
        self.image = image
        self.epoch = epoch or 0
        self.meta = meta

        super(ImageSet, self).__init__(self.cat)
        self.initialize_step_counter(step, self.name)

    def __str__(self):
        return self.name

    def serialize(self) -> Record:
        image_pb = ImageSetRecord()
        image_pb.path = self.image.path

        if self.meta:
            for k, v in self.meta.items():
                meta_record = image_pb.meta.add()
                meta_record.key = str(k)
                meta_record.value = str(v)

        data_bytes = self.serialize_pb_object(image_pb, self.step, self.epoch)

        return Record(
            name=self.name,
            cat=self.cat,
            content=data_bytes,
            binary_type=self.PROTOBUF
        )

    def save_blobs(self, name: str, abs_path: str = None):
        pass
