import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from aim.web.configs import AIM_ENV_MODE_KEY
from aim.web.api.config import config
from contextlib import contextmanager

env = os.environ.get(AIM_ENV_MODE_KEY, 'prod')
config = config[env]

engine = create_engine(
    config.SQLALCHEMY_DATABASE_URI, echo=config.SQLALCHEMY_ECHO, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@contextmanager
def get_contexted_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
