from typing import Any
from abc import ABCMeta, abstractmethod

import numpy as np

from aim.sdk.artifacts.serializable import Serializable
from aim.engine.utils import is_pytorch_module


class Distribution(Serializable):
    cat = ('distribution',)

    def __init__(self, name: str, dist: Any):
        self.name = name
        self.dist = dist

        super(Distribution, self).__init__(self.cat)

    def __str__(self):
        return '{name}'.format(name=self.name)

    def serialize(self) -> dict:
        serialized = {
            self.JSON_FILE: {
                'name': self.name,
                'cat': self.cat,
                'content': self.dist,
                'mode': self.CONTENT_MODE_APPEND,
            },
        }

        return serialized


class ModelDistribution(Serializable, metaclass=ABCMeta):
    def __init__(self, model: Any):
        self.model = model
        self.hist = self.get_layers(self.model)

        super(ModelDistribution, self).__init__(self.cat)

    def serialize(self):
        serialized = {
            self.DIR: {
                'name': self.name,
                'files': [],
                'data': {
                    'layers': [],
                },
            },
        }

        for name, params in self.hist.items():
            serialized_dir = serialized[self.DIR]

            # Serialize layer weights
            w_dist_name = '{}__weight'.format(name)
            w_dist = Distribution(w_dist_name, params['weight'])
            serialized_dir['files'].append(w_dist.serialize())

            # Serialize layer biases
            b_dist_name = '{}__bias'.format(name)
            b_dist = Distribution(b_dist_name, params['bias'])
            serialized_dir['files'].append(b_dist.serialize())

            serialized_dir['data']['layers'].append({
                'name': name,
                'weight': w_dist_name,
                'bias': b_dist_name,
            })

        return serialized

    @staticmethod
    @abstractmethod
    def get_layers(self):
        ...


class WeightsDistribution(ModelDistribution):
    name = 'weights'
    cat = ('weights',)

    @classmethod
    def get_layers(cls, model, parent_name=None):
        layers = {}
        if is_pytorch_module(model):
            from torch import nn

            for name, m in model.named_children():
                if isinstance(m, nn.Sequential):
                    layers.update(cls.get_layers(m,
                                                 '{}.Sequential'.format(name)))
                else:
                    if hasattr(m, 'weight'):
                        layer_name = '{}__{}'.format(parent_name, name) \
                            if parent_name \
                            else name
                        layer_name += '.{}'.format(type(m).__name__)

                        weight_hist = np.histogram(m.weight.data.numpy(), 30)
                        bias_hist = np.histogram(m.bias.data.numpy(), 30)

                        layers[layer_name] = {
                            'weight': [
                                weight_hist[0].tolist(),
                                weight_hist[1].tolist(),
                            ],
                            'bias': [
                                bias_hist[0].tolist(),
                                bias_hist[1].tolist(),
                            ],
                        }

        return layers


class GradientsDistribution(ModelDistribution):
    name = 'gradients'
    cat = ('gradients',)

    @classmethod
    def get_layers(cls, model, parent_name=None):
        layers = {}
        if is_pytorch_module(model):
            from torch import nn

            for name, m in model.named_children():
                if isinstance(m, nn.Sequential):
                    layers.update(cls.get_layers(m,
                                                 '{}.Sequential'.format(name)))
                else:
                    if hasattr(m, 'weight'):
                        layer_name = '{}__{}'.format(parent_name, name) \
                            if parent_name \
                            else name
                        layer_name += '.{}'.format(type(m).__name__)

                        weight_hist = np.histogram(m.weight.grad.numpy(), 30)
                        bias_hist = np.histogram(m.bias.grad.numpy(), 30)

                        layers[layer_name] = {
                            'weight': [
                                weight_hist[0].tolist(),
                                weight_hist[1].tolist(),
                            ],
                            'bias': [
                                bias_hist[0].tolist(),
                                bias_hist[1].tolist(),
                            ],
                        }

        return layers
