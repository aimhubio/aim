import json
import os
import tarfile
from io import StringIO


class AimModel:
    def __init__(self):
        self.metadata = ModelMetadata()
        self.onnx = None

    def set_meta(self, meta_dict):
        if not meta_dict:
            raise Exception('Provided Model Meta Dictionary is empty')
        elif 'framework' not in meta_dict:
            raise Exception(
                '\'framework\' is missing in Model Meta Dictionary')
        elif 'input_shape' not in meta_dict:
            raise Exception(
                '\'input_shape\' is missing in Model Meta Dictionary')

        for k in meta_dict.keys():
            self.metadata.__setattr__(k, meta_dict[k])

    def set_onnx(self, onnx):
        self.onnx = onnx
        return self

    def serialize(self, dest, name):
        metadata_path = os.path.abspath(dest + '/metadata.json')
        self.metadata.serialize(metadata_path)

        file_path = os.path.abspath('{0}/{1}.aim'.format(dest, name))
        model_path = os.path.abspath('{0}/{1}.onnx'.format(dest, name))

        with open(model_path, 'wb+') as model_file:
            model_file.write(self.onnx)

        with tarfile.open(name=file_path, mode='w:gz') as tar:
            tar.add(metadata_path, arcname='metadata.json')
            tar.add(model_path, arcname=name + '.onnx')
        # cleanup temp files
        os.remove(metadata_path)
        os.remove(model_path)

    def model(self):
        pass


class ModelMetadata():
    FRAMEWORK = 'framework'
    FRAMEWORK_VERSION = 'framework_version'
    INPUT_SHAPE = 'input_shape'

    def __init__(self):
        self.__dict__['framework'] = ''
        self.__dict__['input_shape'] = []
        self.__dict__['_attributes'] = [
            ModelMetadata.FRAMEWORK,
            ModelMetadata.FRAMEWORK_VERSION,
            ModelMetadata.INPUT_SHAPE]

    def __setattr__(self, name, value):
        if name not in self.__dict__['_attributes']:
            raise Exception(
                '{} is not permitted in ModelMetadata'.format(name))
        self.__dict__[name] = value

    def _to_dict(self):
        dict = {}
        for attr in self.__dict__['_attributes']:
            if attr in self.__dict__:
                dict[attr] = self.__dict__[attr]
        return dict

    def serialize(self, path):
        dir, _ = os.path.split(path)
        metadata_dict = self._to_dict()
        if not os.path.exists(dir):
            os.makedirs(path)
        with open(path, 'w') as metadata_file:
            json.dump(metadata_dict, metadata_file)

    def serialize_stream(self):
        metadata_dict = self._to_dict()
        meta_io = StringIO()
        json.dump(metadata_dict, meta_io)
        return meta_io
