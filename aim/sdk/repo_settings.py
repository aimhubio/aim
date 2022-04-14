import os
import shutil
from typing import Union

import yaml

from aim.storage.object import StorageClass, CustomObject

here = os.path.abspath(os.path.dirname(__file__))


class RepoSettings:
    def __init__(self, config_path: str):
        self.config_file_path = config_path
        self._config = None
        self._load_config()

    def reset_to_default(self):
        shutil.copy(f'{here}/default_config.yaml', self.config_file_path)

    def set(self, key: str, val: str):
        if key not in self.KNOWN_SETTINGS:
            raise RuntimeError(f'Unknown setting {key}.')

        setter_fn = self.SETTERS.get(key, RepoSettings._default_setter)
        setter_fn(self, key, val)
        self._save_config()

    def _load_config(self):
        if not os.path.exists(self.config_file_path):
            shutil.copy(f'{here}/default_config.yaml', self.config_file_path)
        with open(self.config_file_path, 'r') as stream:
            self._config = yaml.safe_load(stream)
            assert isinstance(self._config, dict)

    def _save_config(self):
        tmp_config_path = f'{self.config_file_path}.tmp'
        try:
            with open(tmp_config_path, 'w') as stream:
                yaml.safe_dump(self._config, stream)
            shutil.move(tmp_config_path, self.config_file_path)
        except:  # noqa
            shutil.rmtree(tmp_config_path, ignore_errors=True)
            raise

    def _default_setter(self, key: str, val: str):
        key_path = key.split('.')
        self._set(self._config, key_path, val)

    def _storage_class_setter(self, key: str, val: str):
        assert key == 'blob-storage-class'
        assert val in StorageClass.allowed_classes

        if val == StorageClass.AUTO:
            for type_name, obj_type in CustomObject.registry.items():
                assert issubclass(obj_type, CustomObject)

                if type_name.startswith('aim.'):
                    type_name = type_name[4:]
                    storage_class = obj_type.default_storage_class()
                    self._set(self._config, ('blob-storage-class', type_name), storage_class)
        else:
            for type_name in CustomObject.registry.keys():
                if type_name.startswith('aim.'):
                    type_name = type_name[4:]
                    self._set(self._config, ('blob-storage-class', type_name), val)

    KNOWN_SETTINGS = {
        'blob-storage-class',
    }

    SETTERS = {
        'blob-storage-class': _storage_class_setter
    }

    @staticmethod
    def _set(conf: dict, key_path: Union[list, tuple], val: str):
        key, *sub = key_path
        if not sub:
            conf[key] = val
        else:
            if key not in conf:
                conf[key] = {}
            RepoSettings._set(conf[key], sub, val)