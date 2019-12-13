from typing import Any
from abc import ABCMeta

from aim.sdk.artifacts.serializable import Serializable


class Metric(Serializable, metaclass=ABCMeta):
    cat = ('metrics',)

    def __init__(self, name: str, value: Any):
        self.name = name
        self.value = value

        super(Metric, self).__init__(self.cat)

    def __str__(self):
        return '{name}: {value}'.format(name=self.name,
                                        value=self.value)

    def serialize(self) -> dict:
        serialized = {
            self.LOG_FILE: {
                'name': self.name,
                'cat': self.cat,
                'content': self.value,
                'mode': self.CONTENT_MODE_APPEND,
            },
        }

        return serialized


class Accuracy(Metric):
    name = 'accuracy'


class Loss(Metric):
    name = 'loss'
