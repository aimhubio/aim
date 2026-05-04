import io
import os
import tempfile

from aim.sdk import Video
from tests.base import TestBase


class TestVideoConstruction(TestBase):
    def test_video_from_bytes(self):
        video_bytes = b'fake mp4 bytes'
        video = Video(data=video_bytes, format='mp4', fps=24, caption='sample')

        self.assertEqual('sample', video.caption)
        self.assertEqual('mp4', video.format)
        self.assertEqual(24, video.fps)
        self.assertEqual(len(video_bytes), video.size)
        self.assertEqual(video_bytes, video.get().read())
        self.assertDictEqual(
            {
                'caption': 'sample',
                'format': 'mp4',
                'fps': 24,
                'size': len(video_bytes),
            },
            video.json(),
        )

    def test_video_from_bytes_io(self):
        video = Video(data=io.BytesIO(b'gif bytes'), format='gif')

        self.assertEqual('gif', video.format)
        self.assertEqual(b'gif bytes', video.get().read())

    def test_video_from_path_defers_blob_read_until_encode(self):
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as file:
            file.write(b'path video bytes')
            video_path = file.name

        try:
            video = Video(path=video_path, fps=30, caption='from path')

            self.assertEqual('mp4', video.format)
            self.assertEqual(os.path.getsize(video_path), video.size)
            self.assertEqual(os.path.abspath(video_path), video.storage['source_path'])
            self.assertIsNone(video.storage.get('data'))
            self.assertEqual(b'path video bytes', video.get().read())

            name, _ = video._aim_encode()

            self.assertEqual('aim.video', name)
            self.assertIsNone(video.storage.get('source_path'))
            self.assertEqual(b'path video bytes', video.get().read())
        finally:
            os.unlink(video_path)

    def test_video_requires_supported_format(self):
        with self.assertRaises(ValueError):
            Video(data=b'bytes', format='avi')

    def test_video_supports_common_mp4_container_extensions(self):
        video = Video(data=b'bytes', format='m4v')

        self.assertEqual('m4v', video.format)
