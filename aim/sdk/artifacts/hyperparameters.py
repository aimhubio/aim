from typing import Any
from abc import ABCMeta

from aim.sdk.artifacts.serializable import Serializable


class HyperParameters(Serializable, metaclass=ABCMeta):
    name = 'hyperparameters'
    cat = ('hyperparameters',)

    def __init__(self, value: Any):
        self.value = value

        super(HyperParameters, self).__init__(self.cat)

    def __str__(self):
        return '{name}: {value}'.format(name=self.name,
                                        value=self.value)

    def serialize(self) -> dict:
        serialized = {
            self.LOG_FILE: {
                'name': self.name,
                'cat': self.cat,
                'content': self.value,
                'mode': self.CONTENT_MODE_WRITE,
            },
        }

        return serialized
