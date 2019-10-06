import torch


class Model:
    pass


class Checkpoint:
    def __init__(self, name, checkpoint_name,
                 model, epoch, lr_rate=None, opt=None, meta=None):
        if isinstance(model, torch.nn.Module):
            self.name = name
            self.checkpoint_name = checkpoint_name
            self.model = model
            self.opt = opt
            self.epoch = epoch
            self.lr_rate = lr_rate
            self.meta = meta
        else:
            raise ValueError('model should be an instance of nn.Module')

    def save(self, path):
        # Save torch model to path
        torch.save({
            'model': self.model,
            'opt': self.opt,
        }, path)
