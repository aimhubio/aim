import os
import zipfile
import json
import tempfile
from typing import Any

from aim.engine.utils import is_keras_model, is_pytorch_module, get_module
from aim.sdk.artifacts.serializable import Serializable


class Checkpoint(Serializable):
    cat = ('models',)

    @staticmethod
    def load(path: str) -> (bool, Any):
        # Get model archive
        model_path = path

        if not os.path.isfile(path):
            # Try to get absolute path
            working_dir = os.getcwd()
            model_path = os.path.join(working_dir, path)
            if not os.path.isfile(model_path):
                return False, None

        # Open model archive
        model_arch = zipfile.ZipFile(model_path, 'r')

        # Read meta file
        try:
            meta_file = model_arch.read('model.json')
            meta_info = json.loads(meta_file)
        except Exception:
            return False, None

        # Load the model
        if meta_info['model']['lib'] == 'keras':
            keras_models = get_module('keras.models')

            # Create model architecture
            arch = meta_info['model']['arch']
            model = keras_models.model_from_json(model_arch.read(arch))

            # Create weights file to load weights from it
            tmp_model_weights_file = tempfile.NamedTemporaryFile()
            with tmp_model_weights_file as weights_file:
                weights_file_name = meta_info['model']['weights']
                weights_file.write(model_arch.read(weights_file_name))
                model.load_weights(tmp_model_weights_file.name)
            tmp_model_weights_file.close()

            return True, model
        if meta_info['model']['lib'] == 'pytorch':
            torch = get_module('torch')

            # Create weights file to load weights from it
            tmp_model_file = tempfile.NamedTemporaryFile()
            with tmp_model_file as model_file:
                model_file_name = meta_info['model']['model']
                model_file.write(model_arch.read(model_file_name))
                model = torch.load(tmp_model_file.name)
            tmp_model_file.close()

            return True, model['model']

        return False, None

    def __init__(self, name: str, checkpoint_name: str,
                 model: Any,
                 epoch: int,
                 lr_rate: float = None,
                 opt: Any = None,
                 meta: dict = None):
        self.name = name
        self.checkpoint_name = checkpoint_name
        self.model = model
        self.opt = opt
        self.epoch = epoch
        self.lr_rate = lr_rate
        self.meta = meta
        self.path = ''

        # Define model backend lib
        lib = 'keras' if is_keras_model(self.model) else \
              'pytorch' if is_pytorch_module(self.model) else None
        self.lib = lib

        super(Checkpoint, self).__init__(self.cat)

    def serialize(self) -> dict:
        serialized = {
            self.MODEL: {
                'name': self.checkpoint_name,
                'cat': self.cat,
                'data': {
                    'epoch': self.epoch,
                    'model_name': self.name,
                    'meta': self.meta,
                },
            },
        }

        return serialized

    def save_model(self, path: str) -> dict:
        # Save torch model to path
        if self.lib == 'pytorch':
            torch = get_module('torch')

            model_path = '{}.pt'.format(path)
            _, _, model_file_name = model_path.rpartition('/')

            # Save model and optimizer
            torch.save({
                'model': self.model.state_dict(),
                'opt': self.opt,
            }, model_path)

            # Specify meta information
            model_save_meta = {
                'lib': 'pytorch',
                'model': model_file_name,
            }

            return model_save_meta
        elif self.lib == 'keras':
            weights_path = '{}.weights.h5'.format(path)
            arch_path = '{}.arch.json'.format(path)

            _, _, weights_file_name = weights_path.rpartition('/')
            _, _, arch_file_name = arch_path.rpartition('/')

            # Save weights
            self.model.save_weights(weights_path)

            # Save model architecture
            with open(arch_path, 'w') as f:
                f.write(self.model.to_json())

            # Specify meta information
            model_save_meta = {
                'lib': 'keras',
                'weights': weights_file_name,
                'arch': arch_file_name,
            }

            return model_save_meta

        return {}
