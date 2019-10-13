import unittest

import aim
from aim import track


class TestSDKTrack(unittest.TestCase):
    def test_sdk_track(self):
        for e in range(1, 2):
            track(aim.loss, 'my_loss', e)
            img = track(aim.image, [1, 2, 3])
            track(aim.misclassification, 'miscls', img, 'A', 'B')
            track(aim.checkpoint, 'model', 'model_ch',
                  [], 1, 0.02, [], {'ss': 22})
