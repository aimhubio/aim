import tempfile
import uuid
import os

from typing import Optional
from io import BytesIO
from pathlib import Path

from aim.ext.external_storage import StorageRegistry
from aim.storage.object import CustomObject, StorageClass
from aim.storage.utils import ExtBLOB


class Artifact(CustomObject):
    @classmethod
    def default_storage_class(cls) -> str:
        return StorageClass.EXTERNAL

    def upload(self, to: str):
        raise NotImplementedError

    def download(self, to: str = None) -> str:
        raise NotImplementedError

    def _get_hash(self) -> str:
        return self.storage.get('hash') or uuid.uuid4().hex[:16]


@CustomObject.alias('aim.file')
class File(Artifact):
    AIM_NAME = 'aim.file'

    def __init__(self, file):
        if isinstance(file, str):
            file = Path(file)

        if isinstance(file, Path):
            self.storage['type'] = 'file'
            self.storage['file_name'] = file.name
            self.storage['file_path'] = str(file)
        elif isinstance(file, (BytesIO, bytes)):
            self.storage['type'] = 'byte-stream'
            self.storage['file_name'] = 'byte-stream'
            self.storage['file_path'] = 'byte-stream'
        else:
            raise TypeError(f'Cannot convert to aim.File. Unsupported type {type(file)}.')
        self.file = file

        hash_ = self._get_hash()
        dest_path = '-'.join((hash_, self.storage['file_name']))
        self.storage['storage_path'] = dest_path
        if isinstance(self.file, Path):
            with open(str(self.file), 'rb') as f_handler:
                self.storage['data'] = ExtBLOB(f_handler.read(), ext_path=dest_path)
        elif isinstance(self.file, BytesIO):
            self.storage['data'] = ExtBLOB(self.file.read(), ext_path=dest_path)
        elif isinstance(self.file, bytes):
            self.storage['data'] = ExtBLOB(self.file, ext_path=dest_path)

    def upload(self, to: str) -> str:
        artifact_storage = StorageRegistry.get_storage(url=to)
        data = self.storage['data'].load()
        path = self.storage['storage_path']
        artifact_storage.put(path, data)
        return path

    def download(self, to: str = None) -> Optional[str]:
        path = self.storage.get('storage_path')
        if path is None:
            return None

        suffix = Path(path).suffix
        file_name = to or tempfile.mktemp(suffix=suffix)
        os.makedirs(os.path.dirname(file_name), exist_ok=True)
        with open(file_name, 'w+b') as f_handler:
            f_handler.write(self.storage['data'].load())
        return file_name


@CustomObject.alias('aim.directory')
class Directory(Artifact):
    AIM_NAME = 'aim.directory'

    def __init__(self, directory, skip_hidden=True):
        if isinstance(directory, str):
            directory = Path(directory)
        self.storage['type'] = 'directory'
        self.storage['dir_name'] = directory.name
        self.storage['dir_path'] = str(directory)
        self.directory = directory

        hash_ = self._get_hash()
        dest_path = '-'.join((hash_, self.storage['dir_name']))

        files = {}
        for root, dirs, file_names in os.walk(self.directory):
            if skip_hidden:
                # skip hidden directories
                dirs[:] = [d for d in dirs if not d[0] == '.']

                # skip hidden files
                file_names = [f for f in file_names if not f[0] == '.']

            rel_dir = os.path.relpath(root, directory)
            for file_name in file_names:
                file_path = os.path.join(root, file_name)
                file_name = os.path.join(rel_dir, file_name)
                with open(file_path, 'rb') as f_handler:
                    files[file_name] = ExtBLOB(f_handler.read(), ext_path=os.path.join(dest_path, file_name))

        self.storage['files'] = files
        self.storage['storage_path'] = dest_path

    def upload(self, to: str):
        artifact_storage = StorageRegistry.get_storage(url=to)
        files = self.storage['files']
        base_path = self.storage['storage_path']
        for file_name, blob in files.items():
            data = blob.load()
            path = os.path.join(base_path, file_name)
            artifact_storage.put(path, data)

    def download(self, to: str = None) -> str:
        path = self.storage.get('storage_path')
        dir_name = self.storage.get('dir_name')
        if path is None or dir_name is None:
            return None

        dir_path = to or tempfile.mkdtemp()
        for file, blob in self.storage['files'].items():
            file_name = os.path.join(dir_path, dir_name, file)
            os.makedirs(os.path.dirname(file_name), exist_ok=True)
            with open(file_name, 'w+b') as f_handle:
                f_handle.write(blob.load())
        return dir_path
