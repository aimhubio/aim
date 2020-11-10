from abc import ABCMeta
import re
from typing import Any, Optional

from aim.artifacts.artifact import Artifact
from aim.artifacts.record import Record
from aim.artifacts.utils import (
    validate_dict,
    format_inf,
    contains_inf,
)
from aim.engine.configs import AIM_NESTED_MAP_DEFAULT


class Map(Artifact):
    cat = ('map',)

    def __init__(self, name: str, value: dict,
                 namespace: Optional[str] = None,
                 **kwargs):
        if not self.validate_name(str(name)) \
                or (namespace is not None
                    and not self.validate_name(str(namespace))):
            raise ValueError('dictionary name can contain only letters, ' +
                             'numbers, underscore and dash')

        val_res, val_item = validate_dict(
            value, (str, int, float, tuple),
            (dict, list, tuple, set, str, int, float, bool,))
        if not val_res:
            raise TypeError(('dictionary contains illegal item: '
                             '`{}` of type `{}`').format(val_item,
                                                         type(val_item)))

        self.name = str(name)
        self.value = format_inf(value) if contains_inf(value) else value
        self.namespace = str(namespace)

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

    def __init__(self, value: Any, **kwargs):
        super(Dataset, self).__init__(self.name, value)


class HyperParameters(Map):
    name = 'hyperparameters'

    def __init__(self, value: Any, **kwargs):
        super(HyperParameters, self).__init__(self.name, value)


class NestedMap(Map):
    cat = ('map', 'nested_map')
    name = 'dictionary'

    def __init__(self, value: dict,
                 namespace: str = AIM_NESTED_MAP_DEFAULT,
                 **kwargs):
        super(NestedMap, self).__init__(self.name, value, namespace)
