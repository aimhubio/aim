from abc import ABCMeta
from typing import Any

from aim.sdk.artifacts.artifact import Artifact
from aim.sdk.artifacts.record import Record


class HyperParameters(Artifact, metaclass=ABCMeta):
    name = 'hyperparameters'
    cat = ('hyperparameters',)

    def __init__(self, value: Any):
        self.value = value

        super(HyperParameters, self).__init__(self.cat)

    def __str__(self):
        return '{name}: {value}'.format(name=self.name,
                                        value=self.value)

    def serialize(self) -> Record:
        return Record(
            name=self.name,
            cat=self.cat,
            content=self.value,
            is_singular=True,
        )

    def save_blobs(self, name: str, abs_path: str = None):
        pass
