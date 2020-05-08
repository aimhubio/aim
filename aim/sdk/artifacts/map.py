from abc import ABCMeta
from typing import Any

from aim.sdk.artifacts.artifact import Artifact
from aim.sdk.artifacts.record import Record


class Map(Artifact, metaclass=ABCMeta):
    cat = ('map',)

    def __init__(self, name: str, value: Any):
        self.name = name
        self.value = value

        super(Map, self).__init__(self.cat)

    def serialize(self) -> Record:
        return Record(
            name=self.name,
            cat=self.cat,
            content=self.value,
            is_singular=True,
        )

    def save_blobs(self, name: str, abs_path: str = None):
        pass


class Dataset(Map):
    name = 'dataset'

    def __init__(self, value: Any):
        super(Dataset, self).__init__(self.name, value)


class HyperParameters(Map):
    name = 'hyperparameters'

    def __init__(self, value: Any):
        super(HyperParameters, self).__init__(self.name, value)
