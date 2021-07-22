from sqlalchemy import Column, Table, ForeignKey
from sqlalchemy import Integer, Text, Boolean, DateTime
from sqlalchemy.orm import relationship, backref
from sqlalchemy.orm import validates

import uuid
import datetime

from aim.storage.run_metadata.db import Base


def get_uuid():
    return str(uuid.uuid4())


def default_to_run_hash(context):
    return f'Run: {context.get_current_parameters()["run_hash"]}'


run_tags = Table(
    'run_tag', Base.metadata,
    Column('run_id', Integer, ForeignKey('run.id'), primary_key=True, nullable=False),
    Column('tag_id', Integer, ForeignKey('tag.id'), primary_key=True, nullable=False)
)


class Run(Base):
    __tablename__ = 'run'

    id = Column(Integer, autoincrement=True, primary_key=True)
    uuid = Column(Text, index=True, unique=True, default=get_uuid)
    name = Column(Text, default=default_to_run_hash)
    description = Column(Text, nullable=True)
    # TODO: [AT] make run_hash immutable
    run_hash = Column(Text, unique=True, nullable=False)

    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    update_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # relationships
    experiment_id = Column(ForeignKey('experiment.id'), nullable=True)

    experiment = relationship('Experiment', backref=backref('runs', uselist=True))
    tags = relationship('Tag', secondary=run_tags)

    def __init__(self, run_hash):
        self.run_hash = run_hash


class Experiment(Base):
    __tablename__ = 'experiment'

    id = Column(Integer, autoincrement=True, primary_key=True)
    uuid = Column(Text, index=True, unique=True, default=get_uuid)
    name = Column(Text, nullable=False, unique=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    update_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def __init__(self, name):
        self.name = name


class Tag(Base):
    __tablename__ = 'tag'

    id = Column(Integer, autoincrement=True, primary_key=True)
    uuid = Column(Text, index=True, unique=True, default=get_uuid)
    name = Column(Text, nullable=False, unique=True)
    color = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    update_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def __init__(self, name):
        self.name = name

    @validates('color')
    def validate_color(self, _, color):
        # TODO: [AT] add color validation
        return color
