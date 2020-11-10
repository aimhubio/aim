from abc import ABCMeta
import re
from typing import Union, Optional

from aim.artifacts import Record
from aim.artifacts.artifact import Artifact
from aim.artifacts.proto.base_pb2 import BaseRecord
from aim.artifacts.proto.metric_pb2 import MetricRecord
from aim.artifacts.utils import validate_dict


class Metric(Artifact):
    cat = ('metrics',)

    def __init__(self, name: str,
                 value: Union[int, float],
                 epoch: int = None,
                 step: int = None,
                 __aim_session_id: Optional[int] = None,
                 **kwargs):
        if not self.validate_name(str(name)):
            raise ValueError('metric name can contain only letters, numbers, ' +
                             'underscore and dash')

        if not isinstance(value, (int, float)):
            raise TypeError('metric value must be a type of int or float')

        # Clean kwargs of metric context
        for item in ['__aim_session_id']:
            if item in kwargs:
                del kwargs[item]

        # Validate context
        val_res, val_item = validate_dict(
            kwargs, (str, int, float,),
            (str, int, float, bool,))
        if not val_res:
            raise TypeError(('Metric context contains illegal item: '
                             '`{}` of type `{}`').format(val_item,
                                                         type(val_item)))

        self.name = str(name)
        self.value = value
        self.epoch = epoch

        self.context = kwargs if len(kwargs.keys()) else {}
        self.hashable_context = tuple(sorted(kwargs.items()))

        super(Metric, self).__init__(self.cat)

        if self.context is not None:
            step_meta = self.hashable_context
        else:
            step_meta = None
        self.initialize_step_counter(step, self.name, step_meta,
                                     session_id=__aim_session_id)

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

    @staticmethod
    def deserialize_pb(data):
        base_pb = BaseRecord()
        base_pb.ParseFromString(data)

        metric_pb = MetricRecord()
        metric_pb.ParseFromString(base_pb.artifact)

        return base_pb, metric_pb

    def save_blobs(self, name: str, abs_path: str = None):
        pass
