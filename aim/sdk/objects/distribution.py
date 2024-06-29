import numpy as np

from aim.storage.object import CustomObject
from aim.storage.types import BLOB


@CustomObject.alias('aim.distribution')
class Distribution(CustomObject):
    """Distribution object used to store distribution objects in Aim repository.

    Args:
        samples (:obj:): Array-like object of data sampled from a distribution.
        bin_count (:obj:`int`, optional): Optional distribution bin count for
            binning `samples`. 64 by default, max 512.
        hist (:obj:, optional): Array-like object representing bin frequency counts.
            Max 512 bins allowed. `samples` must not be specified.
        bin_range (:obj:`tuple`, optional): Tuple of (start, end) bin range.
    """

    AIM_NAME = 'aim.distribution'

    def __init__(self, samples=None, bin_count=64, *, hist=None, bin_range=None):
        super().__init__()

        if samples is not None:
            if hist is not None:
                raise ValueError('hist should not be specified if samples is specified.')
            hist, bin_edges = np.histogram(samples, bins=bin_count)
        elif hist is not None:
            if bin_range is None:
                raise ValueError('Please specify bin_range of (start, end) bins.')
            bin_count = len(hist)
            bin_edges = np.linspace(bin_range[0], bin_range[-1], num=bin_count + 1)
        else:
            raise ValueError('Please specify either samples or hist.')

        hist = np.asanyarray(hist)
        bin_edges = np.asanyarray(bin_edges)
        self._from_np_histogram(hist, bin_edges)

    @classmethod
    def from_histogram(cls, hist, bin_range):
        """Create Distribution object from histogram.

        Args:
            hist (:obj:): Array-like object representing bin frequency counts.
                Max 512 bins allowed.
            bin_range (:obj:`tuple`, optional): Tuple of (start, end) bin range.
        """
        return cls(hist=hist, bin_range=bin_range)

    @classmethod
    def from_samples(cls, samples, bin_count=64):
        """Create Distribution object from data samples.

        Args:
            samples (:obj:): Array-like object of data sampled from a distribution.
            bin_count (:obj:`int`, optional): Optional distribution bin count for
                binning `samples`. 64 by default, max 512.
        """
        return cls(samples=samples, bin_count=bin_count)

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
        return np.frombuffer(self.storage['data'].load(), dtype=self.storage['dtype'], count=self.storage['bin_count'])

    @property
    def ranges(self):
        """Stored distribution ranges

        :getter: Returns distribution ranges as `np.array`.
        :type: np.ndarray
        """
        assert len(self.range) == 2
        return np.linspace(self.range[0], self.range[1], num=self.bin_count + 1)

    def json(self):
        """Dump distribution metadata to a dict"""
        return {
            'bin_count': self.bin_count,
            'range': self.range,
        }

    def _from_np_histogram(self, hist: np.ndarray, bin_edges: np.ndarray):
        bin_count = len(hist)
        if 1 > bin_count > 512:
            raise ValueError('Supported range for `bin_count` is [1, 512].')

        self.storage['data'] = BLOB(data=hist.tobytes())
        self.storage['dtype'] = str(hist.dtype)
        self.storage['range'] = [bin_edges[0].item(), bin_edges[-1].item()]
        self.storage['bin_count'] = bin_count

    def to_np_histogram(self):
        """Return `np.histogram` compatible format of the distribution"""
        return self.weights, self.ranges
