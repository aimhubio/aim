import json
import os
import tarfile
import aim.engine.metadata as meta


class AimModel:
    def __init__(self):
        self.metadata = meta.ModelMetadata()
        self.onnx = None

    def set_meta(self, meta_dict):
        if not meta_dict:
            raise Exception('Provided Model Meta Dictionary is empty')
        self.metadata.set_meta_dict(meta_dict)

    def set_onnx(self, onnx):
        self.onnx = onnx
        return self

    def serialize_onnx(self, dest, name):
        onnx_name = name + '.onnx'
        path = os.path.abspath('{}/{}'.format(dest, onnx_name))
        with open(path, 'wb+') as onnx_file:
            onnx_file.write(self.onnx)

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

    @staticmethod
    def load_model(dest, name):
        model_path = os.path.abspath('{}/{}.aim'.format(dest, name))
        with tarfile.open(name=model_path, mode='r:gz') as model_tar:
            # TODO: verify members
            metadata = model_tar.extractfile(
                'metadata.json').read().decode('utf8')
            onnx = model_tar.extractfile(
                name + '.onnx').read()
        aim_model = AimModel()
        aim_model.set_meta(json.loads(metadata))
        aim_model.set_onnx(onnx)
        return aim_model

    def model(self):
        pass
