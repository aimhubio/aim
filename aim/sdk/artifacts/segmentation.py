import os
from typing import Optional
import gzip
import io
import json
from typing import Any

from aim.sdk.artifacts.artifact import Artifact
from aim.sdk.artifacts.record import Record
from aim.sdk.artifacts.media import Image
from aim.sdk.artifacts.proto.segmentation_pb2 import SegmentationRecord
from aim.engine.utils import is_numpy_array


class Segmentation(Artifact):
    cat = ('segmentation',)
    _step_counter = {}
    _image_paths = {}

    def __init__(self, name: str, obj: Image, mask: Any, epoch: int = None,
                 step: int = None, class_labels: Optional[dict] = None):
        self.name = name
        self.obj = obj
        self.class_labels = class_labels
        self.epoch = epoch

        if isinstance(mask, list):
            self.mask = mask
        elif is_numpy_array(mask):
            self.mask = mask.tolist()
        else:
            raise TypeError('invalid mask type')

        if step is not None:
            self.step = step
        else:
            self._step_counter.setdefault(name, 0)
            self._step_counter[name] += 1
            self.step = self._step_counter[name]

        self._image_paths.setdefault(name, set())
        self._image_paths[name].add(obj.path)

        super(Segmentation, self).__init__(self.cat)

    def serialize(self):
        seg_pb = SegmentationRecord()
        seg_pb.cat = self.obj.cat[-1]
        seg_pb.path = self.obj.path

        mask_json = json.dumps(self.mask)
        mask_bytes = mask_json.encode('utf-8')

        mask_comp_obj = io.BytesIO(b'')
        with gzip.GzipFile(fileobj=mask_comp_obj, mode='wb') as writer:
            writer.write(mask_bytes)
        mask_compressed_bytes = mask_comp_obj.getvalue()

        seg_pb.mask = mask_compressed_bytes
        seg_pb.gzip_compressed = True

        data_bytes = self.serialize_pb_object(seg_pb, self.step, self.epoch)

        return Record(
            name=self.name,
            cat=self.cat,
            content=data_bytes,
            data={
                'class_labels': self.class_labels,
                'image_paths': list(self._image_paths[self.name]),
            },
            binary_type=Artifact.PROTOBUF,
        )

    def get_inst_unique_name(self):
        name_image_suffix = ''
        if self.obj and self.obj.path:
            img_name = self.obj.path.split(os.sep)[-1]
            name_image_suffix, _, _ = img_name.rpartition('.')
        return '{}__{}'.format(self.name, name_image_suffix)

    def save_blobs(self, name: str, abs_path: str = None):
        pass
