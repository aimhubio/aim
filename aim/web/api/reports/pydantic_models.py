from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


# response models
class ReportOut(BaseModel):
    id: UUID
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    updated_at: datetime = 'Wed, 01 Jan 2021 16:12:07 GMT'
    created_at: datetime = 'Wed, 01 Jan 2021 16:12:07 GMT'


# request models
class ReportUpdateIn(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None


class ReportCreateIn(BaseModel):
    name: str
    code: Optional[str] = None
    description: Optional[str] = None


ReportListOut = List[ReportOut]
