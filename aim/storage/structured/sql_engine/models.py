from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Table,
    Text,
)
from sqlalchemy.orm import relationship, backref, validates
from sqlalchemy.ext.declarative import declarative_base

import uuid
import datetime

Base = declarative_base()


def get_uuid():
    return str(uuid.uuid4())


def default_to_run_hash(context):
    return f'Run: {context.get_current_parameters()["hash"]}'


run_tags = Table(
    'run_tag', Base.metadata,
    Column('run_id', Integer, ForeignKey('run.id'), primary_key=True, nullable=False),
    Column('tag_id', Integer, ForeignKey('tag.id'), primary_key=True, nullable=False)
)


class Run(Base):
    __tablename__ = 'run'

    id = Column(Integer, autoincrement=True, primary_key=True)
    # TODO: [AT] make run_hash immutable
    hash = Column(Text, index=True, unique=True, nullable=False)
    name = Column(Text, default=default_to_run_hash)
    description = Column(Text, nullable=True)

    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    finalized_at = Column(DateTime, default=None)

    # relationships
    experiment_id = Column(ForeignKey('experiment.id'), nullable=True)

    experiment = relationship('Experiment', backref=backref('runs', uselist=True, order_by='Run.created_at.desc()'))
    tags = relationship('Tag', secondary=run_tags, backref=backref('runs', uselist=True))
    notes = relationship('Note', back_populates='run')

    def __init__(self, run_hash, created_at=None):
        self.hash = run_hash
        self.created_at = created_at


class Experiment(Base):
    __tablename__ = 'experiment'

    id = Column(Integer, autoincrement=True, primary_key=True)
    uuid = Column(Text, index=True, unique=True, default=get_uuid)
    name = Column(Text, nullable=False, unique=True)
    description = Column(Text, nullable=True)

    # relationships

    notes = relationship('Note', back_populates='experiment')

    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def __init__(self, name):
        self.name = name


class Tag(Base):
    __tablename__ = 'tag'

    id = Column(Integer, autoincrement=True, primary_key=True)
    uuid = Column(Text, index=True, unique=True, default=get_uuid)
    name = Column(Text, nullable=False, unique=True)
    color = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    is_archived = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def __init__(self, name):
        self.name = name

    @validates('color')
    def validate_color(self, _, color):
        # TODO: [AT] add color validation
        return color


class Note(Base):
    __tablename__ = 'note'

    id = Column(Integer, autoincrement=True, primary_key=True)
    content = Column(Text, nullable=False, default='')
    run_id = Column(Integer, ForeignKey('run.id'))
    experiment_id = Column(Integer, ForeignKey('experiment.id'))

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    run = relationship('Run', back_populates='notes')
    experiment = relationship('Experiment', back_populates='notes')
    audit_logs = relationship('NoteAuditLog', back_populates='note')

    def __init__(self, content):
        self.content = content


class NoteAuditLog(Base):
    __tablename__ = 'note_audit_log'

    id = Column(Integer, autoincrement=True, primary_key=True)
    note_id = Column(Integer, ForeignKey('note.id', ondelete='CASCADE'), nullable=False)

    datetime = Column(DateTime, default=datetime.datetime.utcnow)
    action = Column(Text)

    before_edit = Column(Text, nullable=True)
    after_edit = Column(Text, nullable=True)

    note = relationship('Note', back_populates='audit_logs')

    def __init__(self, action, before, after):
        self.action = action
        self.before_edit = before
        self.after_edit = after


class RunInfo(Base):
    __tablename__ = 'run_info'

    id = Column(Integer, autoincrement=True, primary_key=True)
    run_id = Column(Integer, ForeignKey('run.id'))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    last_notification_index = Column(Integer, default=-1)
    run = relationship('Run', uselist=False, backref=backref("info", uselist=False))
