import json
import os
import tempfile
import zipfile
from typing import Any, Callable
import shutil
from pathlib import Path

from aim.artifacts.artifact import Artifact
from aim.artifacts.record import Record
from aim.engine.utils import (
    is_keras_model,
    is_pytorch_module,
    is_tensorflow_session,
    is_tensorflow_estimator,
    get_module
)


class Checkpoint(Artifact):
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
        
        # Create temporary directory
        tmp_copy_dir = tempfile.TemporaryDirectory()
        copy_dir_name = tmp_copy_dir.name
        shutil.copy2(model_path, copy_dir_name)

        # Open model archive
        model_arch = zipfile.ZipFile(model_path, 'r')

        # Read meta file
        try:
            meta_file = model_arch.read('model.json')
            meta_info = json.loads(meta_file)
        except Exception:
            return False, None
        
        # Delete directory if not working with tensorflow
        if 'tensorflow' not in meta_info['model']['lib']:
            tmp_copy_dir.cleanup()

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
        if meta_info['model']['lib'] == 'tensorflow':
            tf = get_module('tensorflow')

            model_name = meta_info['model']['name']

            # Unzip copied .aim file in created directory
            file_path = Path(copy_dir_name)
            files = (x for x in file_path.iterdir() if x.is_file())
            zip_file = next(files)
            with zipfile.ZipFile(zip_file, 'r') as zip_ref:
                zip_ref.extractall(copy_dir_name)

            # Restore session
            sess = tf.Session()
            saver = tf.train.import_meta_graph(
                os.path.join(copy_dir_name, '{}.meta'.format(model_name)))
            saver.restore(sess, os.path.join(copy_dir_name, model_name))
            tmp_copy_dir.cleanup()
            return True, sess
        if meta_info['model']['lib'] == 'tensorflow-est':
            tf = get_module('tensorflow')

            model_name = meta_info['model']['name']

            # Unzip copied .aim file in created directory
            file_path = Path(copy_dir_name)
            files = (x for x in file_path.iterdir() if x.is_file())
            zip_file = next(files)
            with zipfile.ZipFile(zip_file, 'r') as zip_ref:
                zip_ref.extractall(copy_dir_name)
            
            imported = tf.saved_model.load(os.path.join(copy_dir_name,
                                                        model_name))
            tmp_copy_dir.cleanup()
            return True, imported

        return False, None

    def __init__(self, name: str, checkpoint_name: str,
                 model: Any,
                 epoch: int,
                 lr_rate: float = None,
                 opt: Any = None,
                 fn: Callable[[], Any] = None,
                 meta: dict = None):
        self.name = name
        self.checkpoint_name = checkpoint_name
        self.model = model
        self.opt = opt
        self.epoch = epoch
        self.lr_rate = lr_rate
        self.fn = fn
        self.meta = meta
        self.path = ''

        # Define model backend lib
        lib = 'keras' if is_keras_model(self.model) else \
            'pytorch' if is_pytorch_module(self.model) else \
            'tensorflow' if is_tensorflow_session(self.model) else \
            'tensorflow-est' if is_tensorflow_estimator(self.model) else None
        self.lib = lib

        super(Checkpoint, self).__init__(self.cat)

    def serialize(self) -> Record:
        return Record(
            binary_type=self.MODEL,
            name=self.checkpoint_name,
            cat=self.cat,
            data={
                'epoch': self.epoch,
                'model_name': self.name,
                'meta': self.meta,
            },
        )

    def save_blobs(self, path: str, abs_path: str = None) -> dict:
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
        elif self.lib == 'tensorflow':
            tf = get_module('tensorflow')
            saver = tf.train.Saver(save_relative_paths=True)

            saver.save(self.model, path)

            _, _, model_path = path.rpartition('/')

            #Specify meta information
            model_save_meta = {
                'lib': 'tensorflow',
                'name': model_path
            }

            return model_save_meta
        elif self.lib == 'tensorflow-est':
            tf = get_module('tensorflow')

            self.model.export_saved_model(path, self.fn)
            _, _, model_path = path.rpartition('/')
            model_path = os.path.join(model_path, os.listdir(path=path)[0])

            # Specify meta information
            model_save_meta = {
                'lib': 'tensorflow-est',
                'name': model_path
            }
            return model_save_meta
        return {}
