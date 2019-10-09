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
        # Save torch model to path
        if isinstance(self.model, torch.nn.Module):
            model_path = '{}.pt'.format(path)
            torch.save({
                'model': self.model,
                'opt': self.opt,
            }, path)
        elif is_keras_model(self.model):
            model_path = '{}.h5'.format(path)
            self.model.save(model_path)
