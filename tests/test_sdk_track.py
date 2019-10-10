import unittest
import random

from aim.sdk.track import Loss
from aim.sdk.track.track import track


class TestSDKTrack(unittest.TestCase):
    def test_sdk_track(self):
        for e in range(1, 100):
            track(Loss(random.random() / e))
