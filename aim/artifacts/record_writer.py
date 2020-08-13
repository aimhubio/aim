import os
from abc import ABCMeta, abstractmethod
import json
from typing import Any, Optional

from aim.engine.utils import deep_merge


class AbstractRecordWriter(metaclass=ABCMeta):
    APPEND_MODE = 'a'
    WRITE_MODE = 'w'
    MODES = (
        APPEND_MODE,
        WRITE_MODE,
    )

    @abstractmethod
    def write(self, path, mode, content):
        raise NotImplementedError


class JSONRecordWriter(AbstractRecordWriter):
    def write(self, data_file_path: str, mode: str, content: dict):
        if not os.path.isfile(data_file_path):
            # Create data file
            data_file_content = {}
            data_file = open(data_file_path, 'w+')
        else:
            # Get object content
            data_file = open(data_file_path, 'r+')
            data_file_content = json.loads(data_file.read())

        # Set data file content
        if mode == self.APPEND_MODE:
            deep_merge(data_file_content, content, update=True)
        elif mode == self.WRITE_MODE:
            data_file_content = content

        # Update and close data file
        data_file.seek(0)
        data_file.truncate()
        data_file.write(json.dumps(data_file_content))
        data_file.close()


class JsonLogRecordWriter(AbstractRecordWriter):
    def write(self, data_file_path: str, mode: str, content: Any):
        if not content:
            return

        with open(data_file_path, mode) as data_file:
            data_file.writelines([json.dumps(content), '\n'])


class AimRecordWriter(AbstractRecordWriter):
    def __init__(self, storage):
        self.storage = storage

    def write(self, artifact_name: str, mode: str, content: bytes,
              context: Optional[dict] = None) -> int:
        if artifact_name not in self.storage:
            self.storage.open(artifact_name, compression=None)
        record_id = self.storage.append_record(artifact_name, content, context)
        self.storage.flush(artifact_name)
        return record_id


class RecordWriter:
    JSON_WRITER = 'json'
    JSON_LOG_WRITER = 'json_log'
    AIMRECORDS_WRITER = 'aimrecords'

    factories = {
        JSON_WRITER: JSONRecordWriter,
        JSON_LOG_WRITER: JsonLogRecordWriter,
        AIMRECORDS_WRITER: AimRecordWriter,
    }

    @classmethod
    def get_writer(cls, writer_id, *args, **kwargs):
        if writer_id not in cls.factories:
            raise AttributeError('\'RecordWriterFactory\' object has no ' +
                                 'attribute \'{}\''.format(writer_id))
        else:
            return cls.factories[writer_id](*args, **kwargs)
