import uuid

from aim.web.app.db import db
from aim.web.app.utils import datetime_now


class Dashboard(db.Model):
    __tablename__ = 'dashboards'
    uuid = db.Column(db.Text, primary_key=True)
    name = db.Column(db.Text)
    description = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=datetime_now)
    updated_at = db.Column(db.DateTime, default=datetime_now, onupdate=datetime_now)
    is_archived = db.Column(db.Boolean, default=False)

    def __init__(self, name, description):
        self.uuid = str(uuid.uuid1())
        self.name = name
        self.description = description
        self.is_archived = False
