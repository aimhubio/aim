import uuid

import sqlalchemy as sa

from aim.web.api.db import Base
from aim.web.api.utils import datetime_now


class Dashboard(Base):
    __tablename__ = 'dashboards'
    uuid = sa.Column(sa.Text, primary_key=True)
    name = sa.Column(sa.Text)
    description = sa.Column(sa.Text)

    created_at = sa.Column(sa.DateTime, default=datetime_now)
    updated_at = sa.Column(sa.DateTime, default=datetime_now, onupdate=datetime_now)
    is_archived = sa.Column(sa.Boolean, default=False)

    def __init__(self, name, description):
        self.uuid = str(uuid.uuid1())
        self.name = name
        self.description = description
        self.is_archived = False
