from pydantic import BaseModel
from typing import List, Optional, Dict
from uuid import UUID


class ExperimentCreateIn(BaseModel):
    name: str


class ExperimentUpdateIn(BaseModel):
    name: Optional[str] = ''
    description: Optional[str] = ''
    archived: Optional[bool] = None


class ExperimentGetOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = ''
    run_count: int
    archived: bool
    creation_time: Optional[float] = None


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
        archived: bool

    id: UUID
    runs: List[Run]


class ExperimentActivityApiOut(BaseModel):
    num_runs: int
    num_archived_runs: int
    num_active_runs: int
    activity_map: Dict[str, int] = {"2021-01-01": 54}
