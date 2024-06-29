from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class ExploreStateCreateIn(BaseModel):
    type: str
    state: dict


class ExploreStateUpdateIn(BaseModel):
    type: Optional[str] = None
    state: Optional[dict] = None


class ExploreStateGetOut(BaseModel):
    id: UUID
    type: str
    updated_at: datetime = 'Wed, 01 Jan 2021 16:12:07 GMT'
    created_at: datetime = 'Wed, 01 Jan 2021 16:12:07 GMT'
    state: dict


ExploreStateListOut = List[ExploreStateGetOut]
