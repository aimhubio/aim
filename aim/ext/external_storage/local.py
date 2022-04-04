import os
import shutil
import urllib.parse

from aim.ext.external_storage.base import ExternalStorage, StorageTypeCheck, DataNotFoundError


class LocalStorage(ExternalStorage):
    def __init__(self, url):
        super().__init__(url)
        parsed_uri = urllib.parse.urlparse(url)
        assert parsed_uri.scheme == 'file'
        self._bucket_name = parsed_uri.netloc
        path = parsed_uri.path
        if path.endswith('/'):
            path = path[:-1]
        self._prefix = path

    def _put_bytes(self, path: str, data: bytes):
        path = '/'.join((self._prefix, path))
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w+b') as data_loc:
            data_loc.write(data)

    def _put_str(self, path: str, data: str):
        path = '/'.join((self._prefix, path))
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w+') as data_loc:
            data_loc.write(data)

    def put_file(self, path: str, file: str):
        path = '/'.join((self._prefix, path))
        os.makedirs(os.path.dirname(path), exist_ok=True)
        shutil.copy(file, path)

    def get(self, path: str) -> bytes:
        path = '/'.join((self._prefix, path)) if self._prefix else path
        try:
            with open(path, 'rb') as data_loc:
                return data_loc.read()
        except FileNotFoundError as e:
            raise DataNotFoundError(e)

    def get_str(self, path: str) -> str:
        path = '/'.join((self._prefix, path)) if self._prefix else path
        try:
            with open(path, 'r') as data_loc:
                return data_loc.read()
        except FileNotFoundError as e:
            raise DataNotFoundError(e)

    def get_file(self, path: str, dest_path: str):
        path = '/'.join((self._prefix, path)) if self._prefix else path
        shutil.copy(path, dest_path)

    @classmethod
    def scheme(cls):
        return 'file'

    @classmethod
    def status(cls) -> StorageTypeCheck:
        return StorageTypeCheck(True, [])  # local storage is always available
