import uuid

import sqlalchemy as sa

from aim.web.api.db import Base
from aim.web.api.utils import datetime_now


class Report(Base):
    __tablename__ = 'reports'
    uuid = sa.Column(sa.Text, primary_key=True)
    code = sa.Column(sa.Text)
    name = sa.Column(sa.Text)
    description = sa.Column(sa.Text)

    created_at = sa.Column(sa.DateTime, default=datetime_now)
    updated_at = sa.Column(sa.DateTime, default=datetime_now, onupdate=datetime_now)

    def __init__(self, code, name, description):
        self.uuid = str(uuid.uuid1())
        self.code = code
        self.name = name
        self.description = description
