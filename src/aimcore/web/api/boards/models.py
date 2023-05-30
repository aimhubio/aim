import uuid
import hashlib

import sqlalchemy as sa
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship

from aimcore.web.api.db import Base
from aim._sdk.utils import utc_now


class BoardTemplate(Base):
    __tablename__ = 'board_template'
    __table_args__ = (sa.UniqueConstraint('package', 'package_version', 'name', name='_board_template_uc'),)

    id = sa.Column(sa.Text, primary_key=True)

    created_at = sa.Column(sa.DateTime, default=utc_now)
    updated_at = sa.Column(sa.DateTime, default=utc_now, onupdate=utc_now)

    package = sa.Column(sa.Text, nullable=False)
    package_version = sa.Column(sa.Text)
    name = sa.Column(sa.Text, nullable=False)
    description = sa.Column(sa.Text, nullable=True, default=None)
    code = sa.Column(sa.Text)

    def __init__(self, package, name):
        self.id = str(uuid.uuid4())
        self.package = package
        self.name = name

    @hybrid_property
    def checksum(self):
        code = self.code
        return hashlib.md5(code.encode('utf-8')).hexdigest()


class Board(Base):
    __tablename__ = 'board'

    id = sa.Column(sa.Text, primary_key=True)

    created_at = sa.Column(sa.DateTime, default=utc_now)
    updated_at = sa.Column(sa.DateTime, default=utc_now, onupdate=utc_now)

    is_archived = sa.Column(sa.Boolean, default=False)
    name = sa.Column(sa.Text, nullable=False)
    description = sa.Column(sa.Text, nullable=True, default=None)
    code = sa.Column(sa.Text)

    template_id = sa.Column('template_id', sa.ForeignKey('board_template.id'))

    template = relationship('BoardTemplate')

    def __init__(self, name):
        self.id = str(uuid.uuid4())
        self.name = name

    @hybrid_property
    def is_from_template(self) -> bool:
        return self.template_id is not None
