import os
from weakref import WeakValueDictionary

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session

from aim.storage.migrations.utils import upgrade_database

Base = declarative_base()


class DB(object):
    _DIALECT = 'sqlite'
    _DB_NAME = 'run_metadata.sqlite'
    _pool = WeakValueDictionary()

    # TODO: [AT] implement readonly if needed
    def __init__(self, path: str, readonly: bool = False):
        self.path = path
        self.db_url = self.get_db_url(path)
        self.readonly = readonly

        self.engine = create_engine(self.db_url)
        self.session_cls = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=self.engine))
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

    def get_session(self):
        return self.session_cls()

    def run_upgrades(self):
        if self._upgraded:
            return
        upgrade_database(self.db_url)
        self._upgraded = True

    # TODO: [AT] add API for SDK -> insert runs once new ones are started
    # TODO: [AT] add API for QL -> example: run.experiment.name == "Experiment 1" AND run.params.metric IN run.tags.name
