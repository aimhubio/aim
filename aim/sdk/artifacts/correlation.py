from typing import Any

from aim.sdk.artifacts.serializable import Serializable


class Correlation(Serializable):
    cat = ('correlation',)

    def __init__(self, name: str, value: Any, labels):
        self.name = name
        self.value = value
        self.labels = labels

        super(Correlation, self).__init__(self.cat)

    def __str__(self):
        return '{name}'.format(name=self.name)

    def serialize(self) -> dict:
        corr = self.get_correlation()
        serialized = {
            self.JSON_FILE: {
                'name': self.name,
                'cat': self.cat,
                'content': corr,
                'mode': self.CONTENT_MODE_APPEND,
                'data': {
                    'labels': self.labels
                },
            },
        }

        return serialized

    def get_correlation(self) -> list:
        import numpy as np
        if isinstance(self.value, list):
            return np.corrcoef(self.value).tolist()
        elif type(self.value).__name__ == 'Tensor':
            return np.corrcoef(self.value.detach().numpy()).tolist()
        else:
            return []


class LabelCorrelation(Correlation):
    def get_correlation(self) -> list:
        import numpy as np
        if isinstance(self.value, list):
            return np.corrcoef(self.value).tolist()
        elif type(self.value).__name__ == 'Tensor':
            return np.corrcoef(self.value.detach().numpy().T).tolist()
        else:
            return []
