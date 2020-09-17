from abc import ABCMeta
import re
from typing import Any, Optional

from aim.artifacts.artifact import Artifact
from aim.artifacts.record import Record
from aim.artifacts.utils import validate_dict
from aim.engine.configs import AIM_NESTED_MAP_DEFAULT


class Map(Artifact):
    cat = ('map',)

    def __init__(self, name: str, value: dict,
                 namespace: Optional[str] = None,
                 aim_session_id: Optional[int] = None):
        if not self.validate_name(str(name)):
            ValueError('dictionary name can contain only letters, numbers, ' +
                       'underscore, dash and space`')

        val_res, val_item = validate_dict(
            value, (str, int, tuple),
            (dict, list, tuple, set, str, int, float, bool,))
        if not val_res:
            raise TypeError(('dictionary contains illegal item: '
                             '`{}` of type `{}`').format(val_item,
                                                         type(val_item)))

        self.name = re.sub(' +', ' ', str(name))
        self.value = value
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

    def __init__(self, value: Any, aim_session_id: Optional[int] = None):
        super(Dataset, self).__init__(self.name, value)


class HyperParameters(Map):
    name = 'hyperparameters'

    def __init__(self, value: Any, aim_session_id: Optional[int] = None):
        super(HyperParameters, self).__init__(self.name, value)


class NestedMap(Map):
    cat = ('map', 'nested_map')
    name = 'dictionary'

    def __init__(self, value: dict,
                 namespace: str = AIM_NESTED_MAP_DEFAULT,
                 aim_session_id: Optional[int] = None):
        super(NestedMap, self).__init__(self.name, value, namespace)
