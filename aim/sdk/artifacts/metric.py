from abc import ABCMeta
from typing import Any

from aim.sdk.artifacts import Record
from aim.sdk.artifacts.artifact import Artifact


class Metric(Artifact, metaclass=ABCMeta):
    cat = ('metrics',)

    def __init__(self, name: str, value: Any):
        self.name = name
        self.value = value

        super(Metric, self).__init__(self.cat)

    def __str__(self):
        return '{name}: {value}'.format(name=self.name,
                                        value=self.value)

    def serialize(self) -> Record:
        return Record(
            name=self.name,
            cat=self.cat,
            content=self.value,
        )

    def save_blobs(self, name: str, abs_path: str = None):
        pass


class Accuracy(Metric):
    name = 'accuracy'


class Loss(Metric):
    name = 'loss'
