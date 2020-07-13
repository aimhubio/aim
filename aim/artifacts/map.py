from abc import ABCMeta
from typing import Any, Optional

from aim.artifacts.artifact import Artifact
from aim.artifacts.record import Record
from aim.engine.configs import AIM_NESTED_MAP_DEFAULT


class Map(Artifact):
    cat = ('map',)

    def __init__(self, name: str, value: Any, namespace: Optional[str] = None):
        self.name = name
        self.value = value
        self.namespace = namespace

        super(Map, self).__init__(self.cat)

    def serialize(self) -> Record:
        if self.namespace:
            record_content = {
                self.namespace: self.value,
            }
        else:
            record_content = self.value

        return Record(
            name=self.name,
            cat=self.cat,
            content=record_content,
            is_singular=False,
            binary_type=self.JSON,
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


class NestedMap(Map):
    cat = ('map', 'nested_map')
    name = 'dictionary'

    def __init__(self, value: Any, namespace: str = AIM_NESTED_MAP_DEFAULT):
        super(NestedMap, self).__init__(self.name, value, namespace)
