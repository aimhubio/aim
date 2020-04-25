from typing import Any, Optional

from aim.sdk.artifacts.artifact import Artifact
from aim.sdk.artifacts.record import Record
from aim.sdk.artifacts.media import Media
from aim.sdk.artifacts.proto.segmentation_pb2 import SegmentationRecord


class Segmentation(Artifact):
    cat = ('segmentation',)
    _step_counter = {}

    def __init__(self, name: str, obj: Media, mask: list, epoch: int = None,
                 step: int = None, class_labels: Optional[dict] = None):
        self.name = name
        self.obj = obj
        self.mask = mask
        self.class_labels = class_labels
        self.epoch = epoch

        if step is not None:
            self.step = step
        else:
            self._step_counter.setdefault(name, 0)
            self._step_counter[name] += 1
            self.step = self._step_counter[name]

        super(Segmentation, self).__init__(self.cat)

    def serialize(self):
        seg_pb = SegmentationRecord()
        seg_pb.cat = self.obj.cat[-1]
        seg_pb.path = self.obj.path
        for mask_item in self.mask:
            seg_mask_pb = seg_pb.mask.add()
            seg_mask_pb.data.extend(mask_item)

        data_bytes = self.serialize_pb_object(seg_pb, self.step, self.epoch)

        return Record(
            name=self.name,
            cat=self.cat,
            content=data_bytes,
            data={
                'class_labels': self.class_labels,
            },
            binary_type=Artifact.PROTOBUF,
        )

    def save_blobs(self, name: str, abs_path: str = None):
        pass
