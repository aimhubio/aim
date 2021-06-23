import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from aim.engine.configs import AIM_FLASK_ENV_KEY
from aim.web.app.config import config

env = os.environ.get(AIM_FLASK_ENV_KEY, 'prod')
config = config[env]

engine = create_engine(
    config.SQLALCHEMY_DATABASE_URI, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, bind=engine)
Base = declarative_base()


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
