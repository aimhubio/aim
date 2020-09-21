from abc import ABCMeta
import re
from typing import Union, Optional

from aim.artifacts import Record
from aim.artifacts.artifact import Artifact
from aim.artifacts.proto.metric_pb2 import MetricRecord


class Metric(Artifact):
    cat = ('metrics',)

    def __init__(self, name: str,
                 value: Union[int, float],
                 epoch: int = None,
                 step: int = None,
                 aim_session_id: Optional[int] = None,
                 **kwargs):
        if not self.validate_name(str(name)):
            raise ValueError('metric name can contain only letters, numbers, ' +
                             'underscore, dash and space')

        if not isinstance(value, (int, float)):
            raise TypeError('metric value must be a type of int or float')

        self.name = re.sub(' +', ' ', str(name))
        self.value = value
        self.epoch = epoch
        self.context = kwargs if len(kwargs.keys()) else None
        self.hashable_context = tuple(sorted(self.context.items()))

        super(Metric, self).__init__(self.cat)

        if self.context is not None:
            step_meta = self.hashable_context
        else:
            step_meta = None
        self.initialize_step_counter(step, self.name, step_meta,
                                     session_id=aim_session_id)

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
