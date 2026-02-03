import pathlib
import tempfile

from concurrent.futures import Future, ThreadPoolExecutor
from typing import Optional
from urllib.parse import urlparse

from aim.ext.cleanup import AutoClean
from aim.storage.artifacts.artifact_storage import AbstractArtifactStorage


def _import_gcs():
    try:
        from google.cloud import storage

        return storage
    except ImportError:
        raise ImportError("Please install 'aim[gcs]' to use Google Cloud Storage.")


class GCArtifactStorageAutoClean(AutoClean['GCArtifactStorage']):
    """Makes sure all upload threads finish before the storage is destroyed."""

    def __init__(self, instance: 'GCArtifactStorage') -> None:
        super().__init__(instance)
        self._thread_pool = instance._thread_pool

    def _close(self) -> None:
        # wait for all threads to finish
        self._thread_pool.shutdown(wait=True)


class GCArtifactStorage(AbstractArtifactStorage):
    def __init__(self, url: str):
        """
        Args:
            url: GCS bucket URL with optional path prefix (e.g., 'gs://my-bucket/path/prefix').
        """

        super().__init__(url)

        parsed_url = urlparse(self.url)  # e.g. 'gc://my-bucket/path/prefix'
        bucket_name = parsed_url.netloc  # my-bucket
        self._path_prefix = parsed_url.path.lstrip('/')  # path/prefix

        self._bucket = self._get_gcs_client().bucket(bucket_name)

        # thread pool for file upload workers
        self._thread_pool = ThreadPoolExecutor(max_workers=4, thread_name_prefix='gcs-upload')

        # make sure all threads finish uploading before shutting down
        self._resources = GCArtifactStorageAutoClean(self)

    def upload_artifact(self, file_path: str, artifact_path: str, block: bool = False):
        """
        Upload a local file to Google Cloud Storage, in either blocking or non-blocking mode.

        Args:
            file_path: Local path to the file to upload.
            artifact_path: Bucket destination suffix.
            block: If True, the method will block until the upload is complete.
        """

        dest_path = pathlib.Path(self._path_prefix) / artifact_path
        blob = self._bucket.blob(dest_path.as_posix())
        future = self._thread_pool.submit(blob.upload_from_filename, file_path)
        future.add_done_callback(self._upload_complete)

        if block:
            future.result()

    def download_artifact(self, artifact_path: str, dest_dir: Optional[str] = None) -> str:
        """
        Download an artifact from Google Cloud Storage to a local directory in a blocking manner.
        Args:
              artifact_path: Bucket destination suffix.
              dest_dir: Local directory to download the artifact to. If None, a temporary directory is created.
        Returns:
              The local path to the downloaded artifact.
        """

        if dest_dir is None:
            dest_dir = pathlib.Path(tempfile.mkdtemp())
        else:
            dest_dir = pathlib.Path(dest_dir)
            dest_dir.mkdir(parents=True, exist_ok=True)

        source_path = pathlib.Path(self._path_prefix) / artifact_path
        dest_path = dest_dir / source_path.name

        blob = self._bucket.blob(source_path.as_posix())
        blob.download_to_filename(dest_path.as_posix())

        return dest_path.as_posix()

    def delete_artifact(self, artifact_path: str):
        path = pathlib.Path(self._path_prefix) / artifact_path
        blob = self._bucket.blob(path.as_posix())
        blob.delete()

    def _get_gcs_client(self):
        gcs = _import_gcs()
        return gcs.Client()

    def _upload_complete(self, future: Future):
        pass


def GCArtifactStorage_factory(**gcs_client_kwargs):
    class GCArtifactStorageCustom(GCArtifactStorage):
        def _get_gcs_client(self):
            gcs = _import_gcs()
            return gcs.Client(**gcs_client_kwargs)

    return GCArtifactStorageCustom


def GCArtifactStorage_clientconfig(**gcs_client_kwargs):
    """
    Register GCArtifactStorage with custom GCS client configuration.
    Args:
         gcs_client_kwargs: Keyword arguments to pass to the google.cloud.storage.Client constructor.
    """
    from aim.storage.artifacts import registry

    registry.registry['gs'] = GCArtifactStorage_factory(**gcs_client_kwargs)
