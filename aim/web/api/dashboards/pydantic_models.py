from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


# response models
class DashboardOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    app_id: Optional[UUID] = None
    app_type: Optional[str] = None
    updated_at: datetime = 'Wed, 01 Jan 2021 16:12:07 GMT'
    created_at: datetime = 'Wed, 01 Jan 2021 16:12:07 GMT'


# request models
class DashboardUpdateIn(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class DashboardCreateIn(BaseModel):
    name: str
    description: Optional[str] = None
    app_id: Optional[UUID] = None
