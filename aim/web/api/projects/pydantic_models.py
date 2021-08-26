from pydantic import BaseModel
from typing import Dict


class ProjectApiOut(BaseModel):
    name: str
    path: str
    description: str
    telemetry_enabled: int


class ProjectParamsOut(BaseModel):
    params: Dict
    metrics: Dict[str, list]


class ProjectActivityApiOut(BaseModel):
    num_experiments: int
    num_runs: int
    activity_map: Dict[str, int] = {"2021-01-01": 54}
