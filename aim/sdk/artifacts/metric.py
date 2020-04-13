from abc import ABCMeta
from typing import Union

from aim.sdk.artifacts import Record
from aim.sdk.artifacts.artifact import Artifact
from aim.sdk.artifacts.proto.metric_pb2 import MetricRecord


class Metric(Artifact, metaclass=ABCMeta):
    cat = ('metrics',)
    _step_counter = {}

    def __init__(self, name: str, value: Union[int, float], epoch: int = None,
                 step: int = None):
        self.name = name
        self.value = value
        self.epoch = epoch

        if step is not None:
            self.step = step
        else:
            self._step_counter.setdefault(name, 0)
            self._step_counter[name] += 1
            self.step = self._step_counter[name]

        super(Metric, self).__init__(self.cat)

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
            binary_type=self.PROTOBUF
        )

    def save_blobs(self, name: str, abs_path: str = None):
        pass


class Accuracy(Metric):
    name = 'accuracy'
    _step_counter = {}


class Loss(Metric):
    name = 'loss'
    _step_counter = {}
