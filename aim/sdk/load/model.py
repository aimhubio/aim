import json
import os
import zipfile
import tempfile


class Model:
    def __init__(self, path):
        self.path = path

    def load(self):
        # Get model archive
        model_path = self.path
        if not os.path.isfile(self.path):
            # Try to get absolute path
            working_dir = os.environ['PWD']
            model_path = os.path.join(working_dir, self.path)
            if not os.path.isfile(model_path):
                raise FileExistsError('file not exists')

        # Open model archive
        model_arch = zipfile.ZipFile(model_path, 'r')

        # Read meta file
        try:
            meta_file = model_arch.read('model.json')
            meta_info = json.loads(meta_file)
        except Exception:
            raise FileExistsError('met afile not exists')

        # Load the model
        if meta_info['model']['lib'] == 'keras':
            from keras.models import model_from_json

            # Create model architecture
            model = model_from_json(model_arch.read(meta_info['model']['arch']))

            # Create weights file to load weights from it
            tmp_model_weights_file = tempfile.NamedTemporaryFile()
            with tmp_model_weights_file as weights_file:
                weights_file_name = meta_info['model']['weights']
                weights_file.write(model_arch.read(weights_file_name))
                model.load_weights(tmp_model_weights_file.name)
            tmp_model_weights_file.close()

            return model
        if meta_info['model']['lib'] == 'pytorch':
            import torch

            # Create weights file to load weights from it
            tmp_model_file = tempfile.NamedTemporaryFile()
            with tmp_model_file as model_file:
                model_file_name = meta_info['model']['model']
                model_file.write(model_arch.read(model_file_name))
                model = torch.load(tmp_model_file.name)
            tmp_model_file.close()

            return model['model']
        else:
            raise ValueError('model file unknown format')
