import os
from abc import ABCMeta

from aimrecords import Storage

from aim.web.artifacts.artifact import Metric


class AbstractTracker(object, metaclass=ABCMeta):
    def get_updates(self, *args, **kwargs):
        raise NotImplementedError

    def inc_cursor(self):
        raise NotImplementedError


class JsonLogTracker(AbstractTracker):
    def __init__(self, branch, path):
        self._path = self.get_path(branch, path)
        self._cursor = self.get_file_size()

    def get_updates(self):
        size = self.get_file_size()

        if size <= self._cursor:
            self._cursor = size
            raise StopIteration

        if size == self._cursor:
            raise StopIteration

        file = open(self._path, 'r')

        file.seek(self._cursor, 0)

        for l in file.readlines():
            self._cursor += len(l)

            if l and len(l) > 1:
                yield l[:-1]

        file.close()

    def get_file_size(self):
        if os.path.isfile(self._path):
            return os.path.getsize(self._path)
        return 0

    def get_path(self, branch, file_path):
        if not file_path or not branch:
            return None
        return os.path.join(os.getcwd(), '.aim', branch, 'index', 'objects', file_path)

    def inc_cursor(self):
        return False


class AimRecordsTracker(AbstractTracker):
    storage = None

    def __init__(self, branch, name):
        if AimRecordsTracker.storage is None:
            storage_path = os.path.join(os.getcwd(), '.aim', branch, 'index', 'objects')
            AimRecordsTracker.storage = Storage(storage_path, 'r')
        self.name = name

        storage = AimRecordsTracker.storage
        try:
            storage.open(name, uncommitted_bucket_visible=True)
        except:
            self._modified = 0
            self._cursor = 0
        else:
            self._modified = storage.get_modification_time(name)
            self._cursor = storage.get_records_num(name)

        if name in storage:
            storage.close(name)

    def inc_cursor(self):
        self._cursor += 1

    def get_updates(self):
        storage = AimRecordsTracker.storage

        try:
            storage.open(self.name, uncommitted_bucket_visible=True)
        except:
            raise StopIteration

        for r in storage.read_records(self.name, slice(self._cursor, None)):
            yield r

        if self.name in storage:
            storage.close(self.name)

class File:
    def __init__(self, hash, data):
        self.hash = hash
        self.data = data
        self._tracker = None

        if self.data.get('format') == 'aimrecords':
            self._tracker = AimRecordsTracker(self.data.get('branch'),
                                              self.data.get('name'))
        else:
            self._tracker = JsonLogTracker(self.data.get('branch'),
                                           self.data.get('file_path'))

    def __eq__(self, other):
        return self.hash == other.hash

    def __hash__(self):
        return hash(self.hash)

    def deserialize_item(self, item):
        if self.data.get('format') == 'aimrecords':
            if self.data.get('insight') == 'metric':
                _, metric = Metric.deserialize(item)
                return metric.value
        else:
            return item

    def inc_cursor(self):
        self._tracker.inc_cursor()

    def get_updates(self):
        return self._tracker.get_updates()
