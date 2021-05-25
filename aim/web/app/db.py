from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

from aim.engine.types import Singleton

db = None


class Db(metaclass=Singleton):
    @classmethod
    def __init__(cls, app):
        global db

        # Set up database
        db = SQLAlchemy(app)
        Migrate(app, db)
