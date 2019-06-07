import json
import os


class ModelMetadata():
    def __init__(self):
        self.framework = ''
        self.framework_version = ''

    def add_framework(self, framework):
        self.framework = framework
        return self

    def add_framework_version(self, frm_version):
        self.framework_version = frm_version
        return self

    def _to_dict(self):
        if self.framework is '':
            raise ValueError('Framework is not defined.')
        if self.framework_version is '':
            raise ValueError('Framework version is not defined.')
        return {
            'framework': self.framework,
            'framework_version': self.framework_version}

    def serialize(self, path):
        dir, _ = os.path.split(path)
        metadata_dict = self._to_dict()
        if not os.path.exists(dir):
            os.makedirs(path)
        with open(path, 'w') as metadata_file:
            json.dump(metadata_dict, metadata_file)
