import os

from collections import defaultdict
from weakref import WeakValueDictionary

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session

from aim.storage.migrations.utils import upgrade_database
from aim.storage.structured.sql_engine.factory import ModelMappedFactory as ObjectFactory
from aim.storage.types import SafeNone
from aim.web.configs import AIM_LOG_LEVEL_KEY


class ObjectCache:
    def __init__(self, data_fetch_func, key_func):
        self._data = defaultdict(SafeNone)
        self._cached = False
        self.data_fetch_func = data_fetch_func
        self.key_func = key_func

    def fill_cache(self):
        for obj in self.data_fetch_func():
            self._data[self.key_func(obj)] = obj

    def keys(self) -> list:
        if not self._cached:
            self.fill_cache()
            self._cached = True
        return list(self._data.keys())

    def empty_cache(self):
        self._data.clear()
        self._cached = False

    def __setitem__(self, key, value):
        assert self._cached
        self._data[key] = value

    def __getitem__(self, key):
        if not self._cached:
            self.fill_cache()
            self._cached = True
        return self._data[key]


class DB(ObjectFactory):
    _DIALECT = 'sqlite'
    _DB_NAME = 'run_metadata.sqlite'
    _pool = WeakValueDictionary()

    _caches = dict()

    # TODO: [AT] implement readonly if needed
    def __init__(self, path: str, readonly: bool = False):
        import logging
        super().__init__()
        self.path = path
        self.db_url = self.get_db_url(path)
        self.readonly = readonly
        self.engine = create_engine(self.db_url,
                                    echo=(logging.INFO >= int(os.environ.get(AIM_LOG_LEVEL_KEY, logging.WARNING))))
        self.session_cls = scoped_session(sessionmaker(autoflush=False, bind=self.engine))
        self._upgraded = None

    @classmethod
    def from_path(cls, path: str, readonly: bool = False):
        db = cls._pool.get(path)
        if not db:
            db = DB(path, readonly)
            cls._pool[path] = db
        return db

    @staticmethod
    def get_default_url():
        return DB.get_db_url('.aim')

    @staticmethod
    def get_db_url(path: str) -> str:
        if os.path.exists(path):
            db_url = f'{DB._DIALECT}:///{path}/{DB._DB_NAME}'
            return db_url
        else:
            raise RuntimeError(f'Cannot find database {path}. Please init first.')

    @property
    def caches(self):
        return self._caches

    def get_session(self, autocommit=True):
        session = self.session_cls()
        setattr(session, 'autocommit', autocommit)
        return session

    def run_upgrades(self):
        if self._upgraded:
            return
        upgrade_database(self.db_url)
        self._upgraded = True

    def init_cache(self, cache_name, callback, key_func):
        if cache_name in self._caches:
            return
        self._caches[cache_name] = ObjectCache(callback, key_func)

    def invalidate_all_caches(self):
        self._caches.clear()

    def invalidate_cache(self, cache_name):
        if self._caches.get(cache_name):
            del self._caches[cache_name]
