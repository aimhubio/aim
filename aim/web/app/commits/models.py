import uuid
import sqlalchemy as sa

from sqlalchemy.orm import relationship

from aim.web.app.utils import datetime_now
from aim.web.app.db import Base

CommitTagAssociation = sa.Table('commit_tag',
                                Base.metadata,
                                sa.Column('commit_id', sa.Text, sa.ForeignKey('commits.uuid')),
                                sa.Column('tag_id', sa.Text, sa.ForeignKey('tags.uuid')))


class Commit(Base):
    __tablename__ = 'commits'
    __table_args__ = (sa.UniqueConstraint('experiment_name', 'hash'),)

    uuid = sa.Column(sa.Text, primary_key=True)
    hash = sa.Column(sa.Text)
    experiment_name = sa.Column(sa.Text, default='')
    tags = relationship('Tag', secondary=CommitTagAssociation, back_populates='commits')
    session_started_at = sa.Column(sa.Integer, default=0)
    session_closed_at = sa.Column(sa.Integer, default=0)
    created_at = sa.Column(sa.DateTime, default=datetime_now)
    is_archived = sa.Column(sa.Boolean, default=False)

    def __init__(self, hash, experiment_name):
        self.uuid = self.generate_uuid()
        self.hash = hash
        self.experiment_name = experiment_name
        self.is_archived = False

    @staticmethod
    def generate_uuid():
        return str(uuid.uuid1())


class TFSummaryLog(Base):
    __tablename__ = 'tf_summary_logs'

    uuid = sa.Column(sa.Text, primary_key=True)
    log_path = sa.Column(sa.Text)
    params = sa.Column(sa.Text)
    created_at = sa.Column(sa.DateTime, default=datetime_now)
    is_archived = sa.Column(sa.Boolean)

    def __init__(self, path):
        self.uuid = str(uuid.uuid1())
        self.log_path = path
        self.is_archived = False


class Tag(Base):
    __tablename__ = 'tags'

    uuid = sa.Column(sa.Text, primary_key=True)
    name = sa.Column(sa.Text)
    color = sa.Column(sa.Text)
    commits = relationship('Commit', secondary=CommitTagAssociation, back_populates="tags")
    created_at = sa.Column(sa.DateTime, default=datetime_now)
    is_archived = sa.Column(sa.Boolean)
    is_hidden = sa.Column(sa.Boolean, default=False)

    def __init__(self, name, color):
        self.uuid = str(uuid.uuid1())
        self.name = name
        self.color = color
        self.is_archived = False
        self.is_hidden = False
