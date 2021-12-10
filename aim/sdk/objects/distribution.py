import numpy as np

from typing import Tuple

from aim.storage.object import CustomObject
from aim.storage.types import BLOB


@CustomObject.alias('aim.distribution')
class Distribution(CustomObject):
    """Distribution object used to store distribution objects in Aim repository.

    Args:
         distribution (:obj:): array-like object used to construct `aim.Distribution`.
         bin_count (:obj:`int`, optional): Optional distribution bin count. 64 by default, max 512.
    """

    AIM_NAME = 'aim.distribution'

    def __init__(self, distribution, bin_count=64):
        super().__init__()

        if not isinstance(bin_count, int):
            raise TypeError('`bin_count` must be an integer.')
        if 1 > bin_count > 512:
            raise ValueError('Supported range for `bin_count` is [1, 512].')
        self.storage['bin_count'] = bin_count

        # convert to np.histogram
        try:
            np_histogram = np.histogram(distribution, bins=bin_count)
        except TypeError:
            raise TypeError(f'Cannot convert to aim.Distribution. Unsupported type {type(distribution)}.')
        self._from_np_histogram(np_histogram)

    @property
    def bin_count(self):
        """Stored distribution bin count

            :getter: Returns distribution bin_count.
            :type: string
        """
        return self.storage['bin_count']

    @property
    def range(self):
        """Stored distribution range

            :getter: Returns distribution range.
            :type: List
        """
        return self.storage['range']

    @property
    def weights(self):
        """Stored distribution weights

            :getter: Returns distribution weights as `np.array`.
            :type: np.ndarray
        """
        return np.frombuffer(self.storage['data'].load(),
                             dtype=self.storage['dtype'],
                             count=self.storage['bin_count'])

    @property
    def ranges(self):
        """Stored distribution ranges

            :getter: Returns distribution ranges as `np.array`.
            :type: np.ndarray
        """
        assert (len(self.range) == 2)
        return np.linspace(self.range[0], self.range[1], num=self.bin_count)

    def json(self):
        """Dump distribution metadata to a dict"""
        return {
            'bin_count': self.bin_count,
            'range': self.range,
        }

    def _from_np_histogram(self, np_histogram: Tuple[np.ndarray, np.ndarray]):
        assert isinstance(np_histogram[0], np.ndarray)
        assert isinstance(np_histogram[1], np.ndarray)

        self.storage['data'] = BLOB(data=np_histogram[0].tobytes())
        self.storage['dtype'] = str(np_histogram[0].dtype)
        self.storage['range'] = [np_histogram[1][0].item(), np_histogram[1][-1].item()]

    def to_np_histogram(self):
        """Return `np.histogram` compatible format of the distribution"""
        return self.weights, self.ranges
