from abc import ABCMeta
import re
from typing import Any, Optional

from aim.artifacts.artifact import Artifact
from aim.artifacts.record import Record
from aim.artifacts.utils import (
    validate_mapping,
    validate_iterable,
    format_floats,
    contains_inf_or_nan,
)
from aim.engine.configs import AIM_NESTED_MAP_DEFAULT


class _MapValidationMixin:
    def validate_value(self):
        val_res, val_item = validate_mapping(
            self.value,
            (str,),
            (str, int, float, list, tuple, dict, bool, type(None)),
            key_str_validator=r'^[^\d\W]\w*\Z',
            iterable_validator=lambda x: validate_iterable(x,
                                                           (str, int, float,
                                                            list, tuple,
                                                            dict, bool,
                                                            type(None)))
        )
        if val_res == 1:
            raise TypeError(('dictionary contains illegal item: ' +
                             '`{}` of type `{}`').format(val_item,
                                                         type(val_item)))
        elif val_res == 2:
            raise TypeError(('dictionary item key must be a ' +
                             'python identifier: `{}`').format(val_item))


class Map(Artifact):
    """
    Map class for managing dictionaries
    """
    cat = ('map',)

    def __init__(self, name: str, value: dict,
                 namespace: Optional[str] = None,
                 **kwargs):
        if not self.validate_name(str(name)) \
                or (namespace is not None
                    and not self.validate_name(str(namespace))):
            raise ValueError('dictionary name must be a python identifier')
        self.name = str(name)
        self.namespace = str(namespace)

        self.value = value
        self.validate_value()

        if contains_inf_or_nan(self.value):
            self.value = format_floats(value)

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

    def validate_value(self):
        pass


class Dataset(_MapValidationMixin, Map):
    name = 'dataset'

    def __init__(self, value: Any, **kwargs):
        super(Dataset, self).__init__(self.name, value)


class HyperParameters(_MapValidationMixin, Map):
    name = 'hyperparameters'

    def __init__(self, value: Any, **kwargs):
        super(HyperParameters, self).__init__(self.name, value)


class NestedMap(_MapValidationMixin, Map):
    cat = ('map', 'nested_map')
    name = 'dictionary'

    def __init__(self, value: dict,
                 namespace: str = AIM_NESTED_MAP_DEFAULT,
                 **kwargs):
        super(NestedMap, self).__init__(self.name, value, namespace)
