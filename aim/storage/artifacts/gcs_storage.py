import pathlib
import tempfile

from concurrent.futures import ThreadPoolExecutor
from concurrent.futures import wait as wait_for_finish
from typing import Optional
from urllib.parse import urlparse
try:
    from google.cloud import storage
except ImportError:
    raise ImportError(
        'google-cloud-storage is required for GCS artifact storage. '
        'Install it with: pip install google-cloud-storage'
    )


from aim.ext.cleanup import AutoClean

from .artifact_storage import AbstractArtifactStorage


class GCSArtifactsStorageAutoClean(AutoClean['GCSArtifactStorage']):
    def __init__(self, instance: 'GCSArtifactStorage') -> None:
        super().__init__(instance)
        self._futures = instance._futures
        self._thread_pool = instance._thread_pool

    def _close(self) -> None:
        wait_for_finish(self._futures)
        self._thread_pool.shutdown()


class GCSArtifactStorage(AbstractArtifactStorage):
    def __init__(self, url: str):
        super().__init__(url)
        res = urlparse(self.url)
        path = res.path
        if path.startswith('/'):
            path = path[1:]
        self._bucket_name = res.netloc
        self._prefix = path
        self._client = self._get_gcs_client()
        self._bucket = self._client.bucket(self._bucket_name)
        self._thread_pool = ThreadPoolExecutor(max_workers=4, thread_name_prefix='gcs-upload')
        self._futures = set()
        self._resources = GCSArtifactsStorageAutoClean(self)

    def upload_artifact(self, file_path: str, artifact_path: str, block: bool = False):
        dest_path = pathlib.Path(self._prefix) / artifact_path
        if block:
            blob = self._bucket.blob(dest_path.as_posix())
            blob.upload_from_filename(file_path)
        else:
            future = self._thread_pool.submit(self._upload_file, file_path, dest_path.as_posix())
            future.add_done_callback(self._upload_complete)
            self._futures.add(future)

    def _upload_file(self, file_path: str, dest_path: str):
        blob = self._bucket.blob(dest_path)
        blob.upload_from_filename(file_path)

    def download_artifact(self, artifact_path: str, dest_dir: Optional[str] = None) -> str:
        if dest_dir is None:
            dest_dir = pathlib.Path(tempfile.mkdtemp())
        else:
            dest_dir = pathlib.Path(dest_dir)
            dest_dir.mkdir(parents=True, exist_ok=True)
        source_path = pathlib.Path(self._prefix) / artifact_path
        dest_path = dest_dir / source_path.name
        blob = self._bucket.blob(source_path.as_posix())
        blob.download_to_filename(dest_path.as_posix())

        return dest_path.as_posix()

    def delete_artifact(self, artifact_path: str):
        path = pathlib.Path(self._prefix) / artifact_path
        blob = self._bucket.blob(path.as_posix())
        blob.delete()

    def _upload_complete(self, future):
        self._futures.remove(future)

    def _get_gcs_client(self):
        client = storage.Client()
        return client


def GCSArtifactStorage_factory(**gcs_client_kwargs):
    class GCSArtifactStorageCustom(GCSArtifactStorage):
        def _get_gcs_client(self):
            client = storage.Client(**gcs_client_kwargs)
            return client

    return GCSArtifactStorageCustom


def GCSArtifactStorage_clientconfig(**gcs_client_kwargs):
    from aim.storage.artifacts import registry

    registry.registry['gs'] = GCSArtifactStorage_factory(**gcs_client_kwargs)
