from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional


class TagCreateIn(BaseModel):
    name: str
    color: Optional[str] = ''


class TagUpdateIn(BaseModel):
    name: Optional[str] = ''
    color: Optional[str] = ''
    archived: Optional[bool] = None


class TagUpdateOut(BaseModel):
    id: UUID
    status: str = 'OK'


class TagGetOut(BaseModel):
    id: UUID
    name: str
    color: Optional[str] = None
    run_count: int = 0
    archived: bool


TagListOut = List[TagGetOut]


class TagGetRunsOut(BaseModel):
    class Run(BaseModel):
        run_id: str
        name: str
        experiment: Optional[str] = None
        creation_time: float

    id: UUID
    runs: List[Run]
