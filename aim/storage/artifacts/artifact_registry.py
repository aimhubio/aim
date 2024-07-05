from functools import lru_cache
from typing import TYPE_CHECKING, Dict, Type
from urllib.parse import urlparse

from .filesystem_storage import FilesystemArtifactStorage
from .s3_storage import S3ArtifactStorage


if TYPE_CHECKING:
    from .artifact_storage import AbstractArtifactStorage


class ArtifactStorageRegistry:
    def __init__(self):
        self.registry: Dict[str, Type['AbstractArtifactStorage']] = {}

    def register(self, name: str, storage: Type['AbstractArtifactStorage']):
        assert name not in self.registry

        self.registry[name] = storage

    @lru_cache(maxsize=100)
    def get_storage(self, url: str) -> 'AbstractArtifactStorage':
        res = urlparse(url)
        if res.scheme not in self.registry:
            raise ValueError(f"'{res.scheme}' is not supported artifact storage scheme.")
        storage_cls = self.registry[res.scheme]
        return storage_cls(url)


registry = ArtifactStorageRegistry()
registry.register('s3', S3ArtifactStorage)
registry.register('file', FilesystemArtifactStorage)
