from abc import ABCMeta
from typing import Union

from aim.artifacts import Record
from aim.artifacts.artifact import Artifact
from aim.artifacts.proto.metric_pb2 import MetricRecord


class Metric(Artifact):
    cat = ('metrics',)

    def __init__(self, name: str,
                 value: Union[int, float],
                 epoch: int = None,
                 step: int = None,
                 **kwargs):
        self.name = name
        self.value = value
        self.epoch = epoch
        self.context = kwargs

        super(Metric, self).__init__(self.cat)
        self.initialize_step_counter(step, self.name)

    def __str__(self):
        return '{name}: {value}'.format(name=self.name,
                                        value=self.value)

    def serialize(self) -> Record:
        metric_pb = MetricRecord()
        metric_pb.value = self.value

        data_bytes = self.serialize_pb_object(metric_pb, self.step, self.epoch)

        return Record(
            name=self.name,
            cat=self.cat,
            content=data_bytes,
            context=self.context,
            binary_type=self.PROTOBUF,
        )

    def save_blobs(self, name: str, abs_path: str = None):
        pass
