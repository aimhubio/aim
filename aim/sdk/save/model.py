import torch

from aim.engine.utils import is_keras_model


class Model:
    pass


class Checkpoint:
    def __init__(self, name, checkpoint_name,
                 model, epoch, lr_rate=None, opt=None, meta=None):
        if isinstance(model, torch.nn.Module) \
                or is_keras_model(model):
            self.name = name
            self.checkpoint_name = checkpoint_name
            self.model = model
            self.opt = opt
            self.epoch = epoch
            self.lr_rate = lr_rate
            self.meta = meta
        else:
            raise ValueError('model can be an instance of ' +
                             'torch.nn.Module or keras.Model')

    def save(self, path):
        model_save_meta = {}

        # Save torch model to path
        if isinstance(self.model, torch.nn.Module):
            model_path = '{}.pt'.format(path)
            _, _, model_file_name = model_path.rpartition('/')

            # Save model and optimizer
            torch.save({
                'model': self.model,
                'opt': self.opt,
            }, model_path)

            # Specify meta information
            model_save_meta = {
                'lib': 'pytorch',
                'model': model_file_name,
            }
        elif is_keras_model(self.model):
            weights_path = '{}.weights.h5'.format(path)
            arch_path = '{}.arch.json'.format(path)

            _, _, weights_file_name = weights_path.rpartition('/')
            _, _, arch_file_name = arch_path.rpartition('/')

            # Save the weights
            self.model.save_weights(weights_path)

            # Save the model architecture
            with open(arch_path, 'w') as f:
                f.write(self.model.to_json())

            # Specify meta information
            model_save_meta = {
                'lib': 'keras',
                'weights': weights_file_name,
                'arch': arch_file_name,
            }

        return model_save_meta
