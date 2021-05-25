from typing import Union
import math

from aim.artifacts import Record
from aim.artifacts.artifact import Artifact
from aim.artifacts.proto.metric_pb2 import MetricRecord
from aim.artifacts.utils import validate_mapping, validate_iterable


class Metric(Artifact):
    """
    Metric class for managing time series
    """
    cat = ('metrics',)

    def __init__(self, name: str,
                 value: Union[int, float],
                 epoch: int = None,
                 step: int = None,
                 **kwargs):
        if not self.validate_name(str(name)):
            raise ValueError('metric name must be a python identifier')
        self.name = str(name)

        if not isinstance(value, (int, float)):
            raise TypeError('metric value must be a type of int or float')

        if isinstance(value, float) \
                and (math.isinf(value) or math.isnan(value)):
            raise TypeError('can not track `NaN` or infinite floats')

        self.value = value

        # Construct context kwargs
        context_kwargs = {}
        for k, v in kwargs.items():
            if not k.startswith('__'):
                context_kwargs[k] = v

        # Validate context
        val_res, val_item = validate_mapping(
            context_kwargs,
            (str,),
            (str, int, float, tuple, bool, type(None)),
            key_str_validator=r'^[^\d\W]\w*\Z',
            iterable_validator=lambda x: validate_iterable(x,
                                                           (str, int, float,
                                                            tuple, bool,
                                                            type(None)))
        )
        if val_res == 1:
            raise TypeError(('metric context contains illegal item: ' +
                             '`{}` of type `{}`').format(val_item,
                                                         type(val_item)))
        elif val_res == 2:
            raise TypeError(('metric context key must be a ' +
                             'python identifier: `{}`').format(val_item))
        self.context = context_kwargs if len(context_kwargs.keys()) else {}
        self.hashable_context = tuple(sorted(context_kwargs.items()))

        super(Metric, self).__init__(self.cat)

        self.epoch = epoch

        if self.context is not None:
            step_meta = self.hashable_context
        else:
            step_meta = None
        self.initialize_step_counter(step, self.name, step_meta,
                                     session_id=kwargs.get('__aim_session_id'))

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

    @classmethod
    def deserialize_pb(cls, data):
        base_pb = cls.deserialize_pb_object(data)

        metric_pb = MetricRecord()
        metric_pb.ParseFromString(base_pb.artifact)

        return base_pb, metric_pb

    def save_blobs(self, name: str, abs_path: str = None):
        pass
