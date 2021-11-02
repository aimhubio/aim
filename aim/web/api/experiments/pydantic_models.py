from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID


class ExperimentCreateIn(BaseModel):
    name: str


class ExperimentUpdateIn(BaseModel):
    name: Optional[str] = ''
    archived: Optional[bool] = None


class ExperimentGetOut(BaseModel):
    id: UUID
    name: str
    run_count: int
    archived: bool


ExperimentListOut = List[ExperimentGetOut]


class ExperimentUpdateOut(BaseModel):
    id: UUID
    status: str = 'OK'


class ExperimentGetRunsOut(BaseModel):
    class Run(BaseModel):
        run_id: str
        name: str
        creation_time: float
        end_time: Optional[float]

    id: UUID
    runs: List[Run]
