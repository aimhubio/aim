from typing import Dict

from aim.ext.external_storage.base import ExternalStorage


class StorageRegistry:
    registry: Dict[str, ExternalStorage] = {}

    @classmethod
    def get_storage(cls, url: str) -> ExternalStorage:
        if cls.registry.get(url) is None:
            scheme = ExternalStorage.parse_scheme(url)
            try:
                storage_cls = ExternalStorage.storage_class_registry[scheme]
            except KeyError:
                raise ValueError(f'Unknown storage scheme {scheme}.')

            assert issubclass(storage_cls, ExternalStorage)
            storage_status = storage_cls.status()
            if not storage_status.exists:
                raise ValueError(f'Storage class {storage_cls} is not enabled.'
                                 f'Please install following packages: {storage_status.deps}.')
            cls.registry[url] = storage_cls(url)
        return cls.registry[url]


# force registry of classes
from aim.ext.external_storage.s3 import S3Storage  # noqa
from aim.ext.external_storage.local import LocalStorage  # noqa
