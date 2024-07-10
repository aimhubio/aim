import os
import pathlib
import shutil
import tempfile

from typing import Optional
from urllib.parse import urlparse

from .artifact_storage import AbstractArtifactStorage


class FilesystemArtifactStorage(AbstractArtifactStorage):
    def __init__(self, url: str):
        super().__init__(url)
        res = urlparse(self.url)
        path = res.path
        self._prefix = path

    def upload_artifact(self, file_path: str, artifact_path: str, block: bool = False):
        dest_path = pathlib.Path(self._prefix) / artifact_path
        dest_dir = os.path.dirname(dest_path)
        os.makedirs(dest_dir, exist_ok=True)
        shutil.copy(file_path, dest_path)

    def download_artifact(self, artifact_path: str, dest_dir: Optional[str] = None) -> str:
        if dest_dir is None:
            dest_dir = pathlib.Path(tempfile.mkdtemp())
        else:
            dest_dir = pathlib.Path(dest_dir)
            dest_dir.mkdir(parents=True, exist_ok=True)
        source_path = dest_path = pathlib.Path(self._prefix) / artifact_path
        dest_path = dest_dir / source_path.name
        shutil.copy(source_path, dest_path)

        return dest_path.as_posix()

    def delete_artifact(self, artifact_path: str):
        path = pathlib.Path(self._prefix) / artifact_path
        shutil.rmtree(path)
