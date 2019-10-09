import unittest

from aim.sdk.track.track import track


class TestSDKTrackImport(unittest.TestCase):
    def test_sdk_track_import(self):
        self.assertTrue(callable(track))
