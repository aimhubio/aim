from typing import Any
from abc import ABCMeta
import json

from aim.sdk.artifacts.serializable import Serializable
from aim.engine.utils import is_pytorch_optim


class MetricGroup(Serializable, metaclass=ABCMeta):
    cat = ('metric_groups',)

    def __init__(self, name: str, value: Any, labels: list = None):
        self.name = name
        self.meta = {}

        if is_pytorch_optim(value) and hasattr(value, 'param_groups'):
            self.values = [g.get('lr') for g in value.param_groups]
            self.meta = {
                'lib': 'pytorch',
                'source': 'param_groups',
            }
        elif isinstance(value, list):
            self.values = value

        if labels and len(labels) != len(self.values):
            raise ValueError('length of values and labels do not match')

        self.labels = labels or []
        self.labels_range = list(range(len(self.values)))

        super(MetricGroup, self).__init__(self.cat)

    def __str__(self):
        return '{name}: {values}'.format(name=self.name,
                                         values=self.values)

    def serialize(self) -> dict:
        serialized = {
            self.LOG_FILE: {
                'name': self.name,
                'cat': self.cat,
                'content': json.dumps(self.values),
                'mode': self.CONTENT_MODE_APPEND,
                'data': {
                    'labels': self.labels,
                    'range': self.labels_range,
                    'meta': self.meta,
                },
            },
        }

        return serialized


class LearningRate(MetricGroup):
    name = 'learning_rate'

    def __init__(self, *args, **kwargs):
        super(LearningRate, self).__init__(self.name, *args, **kwargs)
