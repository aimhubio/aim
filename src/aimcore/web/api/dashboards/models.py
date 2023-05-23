import uuid
import sqlalchemy as sa

from aimcore.web.api.db import Base
from aim._sdk.utils import utc_now


class Dashboard(Base):
    __tablename__ = 'dashboards'
    uuid = sa.Column(sa.Text, primary_key=True)
    name = sa.Column(sa.Text)
    description = sa.Column(sa.Text)

    created_at = sa.Column(sa.DateTime, default=utc_now)
    updated_at = sa.Column(sa.DateTime, default=utc_now, onupdate=utc_now)
    is_archived = sa.Column(sa.Boolean, default=False)

    def __init__(self, name, description):
        self.uuid = str(uuid.uuid1())
        self.name = name
        self.description = description
        self.is_archived = False
