from typing import Dict
import logging

from aim.ext.external_storage import ExternalStorage

logger = logging.getLogger(__name__)


class UploadManager:
    cache = set()
    uploaders = dict()
    storage_registry: Dict[str, ExternalStorage] = dict()

    @staticmethod
    def register_storage(storage: ExternalStorage, chunk: str):
        if chunk not in UploadManager.storage_registry:
            UploadManager.storage_registry[chunk] = storage

    @staticmethod
    def register_uploader(uploader: object, chunk: str):
        obj_id = id(uploader)
        if obj_id not in UploadManager.uploaders:
            UploadManager.uploaders[obj_id] = chunk

    @staticmethod
    def get_uploader_chunk(uploader: object) -> str:
        obj_id = id(uploader)
        return UploadManager.uploaders.get(obj_id)
