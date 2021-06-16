import uuid
from sqlalchemy.orm import relationship

from aim.web.app.db import db
from aim.web.app.utils import datetime_now


CommitTagAssociation = db.Table('commit_tag',
    db.Column('commit_id', db.Text, db.ForeignKey('commits.uuid')),
    db.Column('tag_id', db.Text, db.ForeignKey('tags.uuid')))


class Commit(db.Model):
    __tablename__ = 'commits'
    __table_args__ = (db.UniqueConstraint('experiment_name', 'hash'),)

    uuid = db.Column(db.Text, primary_key=True)
    hash = db.Column(db.Text)
    experiment_name = db.Column(db.Text, default='')
    tags = relationship('Tag', secondary=CommitTagAssociation, back_populates='commits')
    session_started_at = db.Column(db.Integer, default=0)
    session_closed_at = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime_now)
    is_archived = db.Column(db.Boolean, default=False)

    def __init__(self, hash, experiment_name):
        self.uuid = self.generate_uuid()
        self.hash = hash
        self.experiment_name = experiment_name
        self.is_archived = False

    @staticmethod
    def generate_uuid():
        return str(uuid.uuid1())


class TFSummaryLog(db.Model):
    __tablename__ = 'tf_summary_logs'

    uuid = db.Column(db.Text, primary_key=True)
    log_path = db.Column(db.Text)
    params = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime_now)
    is_archived = db.Column(db.Boolean)

    def __init__(self, path):
        self.uuid = str(uuid.uuid1())
        self.log_path = path
        self.is_archived = False


class Tag(db.Model):
    __tablename__ = 'tags'

    uuid = db.Column(db.Text, primary_key=True)
    name = db.Column(db.Text)
    color = db.Column(db.Text)
    commits = relationship('Commit', secondary=CommitTagAssociation, back_populates="tags")
    created_at = db.Column(db.DateTime, default=datetime_now)
    is_archived = db.Column(db.Boolean)
    is_hidden = db.Column(db.Boolean, default=False)

    def __init__(self, name, color):
        self.uuid = str(uuid.uuid1())
        self.name = name
        self.color = color
        self.is_archived = False
        self.is_hidden = False
