import urllib.parse
from typing import Dict, Union
from collections import namedtuple

StorageTypeCheck = namedtuple('StorageTypeCheck', ['exists', 'deps'])


class DataNotFoundError(RuntimeError):
    pass


class ExternalStorage:
    storage_class_registry: Dict[str, 'ExternalStorage'] = {}

    def __init__(self, url: str):
        self._url = url

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        scheme = cls.scheme()
        cls.storage_class_registry[scheme] = cls

    @staticmethod
    def parse_scheme(url):
        parsed = urllib.parse.urlparse(url)
        return parsed.scheme

    @classmethod
    def scheme(cls) -> str:
        raise NotImplementedError

    @classmethod
    def status(cls) -> StorageTypeCheck:
        raise NotImplementedError

    def put(self, path: str, data: Union[bytes, str]):
        if isinstance(data, bytes):
            self._put_bytes(path, data)
        else:
            assert isinstance(data, str)
            self._put_str(path, data)

    def put_file(self, path: str, file):
        raise NotImplementedError

    def _put_bytes(self, path: str, data: bytes):
        raise NotImplementedError

    def _put_str(self, path: str, data: str):
        raise NotImplementedError

    def get(self, path: str) -> bytes:
        raise NotImplementedError

    def get_str(self, path: str) -> str:
        raise NotImplementedError

    def get_file(self, path: str, dest_file: str):
        raise NotImplementedError

    @property
    def url(self):
        return self._url

    # aliases
    path = url
