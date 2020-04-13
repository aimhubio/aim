from typing import Any

from aim.engine.utils import get_module
from aim.sdk.artifacts.artifact import Artifact
from aim.sdk.artifacts.record import Record
from aim.sdk.artifacts.utils import get_pt_tensor


class Correlation(Artifact):
    cat = ('correlation',)

    def __init__(self, name: str, value: Any, labels):
        self.name = name
        self.value = value
        self.labels = labels

        super(Correlation, self).__init__(self.cat)

    def __str__(self):
        return '{name}'.format(name=self.name)

    def serialize(self) -> Record:
        return Record(
            name=self.name,
            cat=self.cat,
            content=self.get_correlation(),
            data={
                'labels': self.labels
            }
        )

    def save_blobs(self, name: str, abs_path: str = None):
        pass

    def get_correlation(self) -> list:
        np = get_module('numpy')
        if isinstance(self.value, list):
            return np.corrcoef(self.value).tolist()
        elif type(self.value).__name__ == 'Tensor':
            t_val = get_pt_tensor(self.value.detach())
            return np.corrcoef(t_val.numpy()).tolist()
        else:
            return []


class LabelCorrelation(Correlation):
    def get_correlation(self) -> list:
        np = get_module('numpy')
        if isinstance(self.value, list):
            return np.corrcoef(self.value).tolist()
        elif type(self.value).__name__ == 'Tensor':
            t_val = get_pt_tensor(self.value.detach())
            return np.corrcoef(t_val.numpy().T).tolist()
        else:
            return []
