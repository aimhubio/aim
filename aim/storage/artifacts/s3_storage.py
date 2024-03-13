import pathlib
import tempfile

from urllib.parse import urlparse
from typing import Optional
from concurrent.futures import ThreadPoolExecutor, wait as wait_for_finish

from aim.ext.cleanup import AutoClean
from .artifact_storage import AbstractArtifactStorage


class S3ArtifactsStorageAutoClean(AutoClean['S3ArtifactStorage']):
    def __init__(self, instance: 'S3ArtifactStorage') -> None:
        super().__init__(instance)
        self._futures = instance._futures
        self._thread_pool = instance._thread_pool

    def _close(self) -> None:
        wait_for_finish(self._futures)
        self._thread_pool.shutdown()


class S3ArtifactStorage(AbstractArtifactStorage):
    def __init__(self, url: str):
        super().__init__(url)
        res = urlparse(self.url)
        path = res.path
        if path.startswith('/'):
            path = path[1:]
        self._bucket = res.netloc
        self._prefix = path
        self._client = self._get_s3_client()
        self._thread_pool = ThreadPoolExecutor(max_workers=4, thread_name_prefix='s3-upload')
        self._futures = set()
        self._resources = S3ArtifactsStorageAutoClean(self)

    def upload_artifact(self, file_path: str, artifact_path: str, block: bool = False):
        dest_path = pathlib.Path(self._prefix) / artifact_path
        if block:
            self._client.upload_file(Filename=file_path, Bucket=self._bucket, Key=dest_path.as_posix())
        else:
            future = self._thread_pool.submit(
                self._client.upload_file, Filename=file_path, Bucket=self._bucket, Key=dest_path.as_posix()
            )
            future.add_done_callback(self._upload_complete)
            self._futures.add(future)

    def download_artifact(self, artifact_path: str, dest_dir: Optional[str] = None) -> str:
        if dest_dir is None:
            dest_dir = pathlib.Path(tempfile.mkdtemp())
        else:
            dest_dir = pathlib.Path(dest_dir)
            dest_dir.mkdir(parents=True, exist_ok=True)
        source_path = pathlib.Path(self._prefix) / artifact_path
        dest_path = dest_dir / source_path.name
        self._client.download_file(Bucket=self._bucket, Key=source_path.as_posix(), Filename=dest_path.as_posix())

        return dest_path.as_posix()

    def delete_artifact(self, artifact_path: str):
        path = pathlib.Path(self._prefix) / artifact_path
        self._client.delete_object(Bucket=self._bucket, Key=path.as_posix())

    def _upload_complete(self, future):
        self._futures.remove(future)

    def _get_s3_client(self):
        import boto3
        client = boto3.client('s3')
        return client
