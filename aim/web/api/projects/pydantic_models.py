from pydantic import BaseModel
from typing import List, Dict
from aim.web.api.experiments.pydantic_models import ExperimentListOut


class ProjectApiOut(BaseModel):
    name: str
    path: str
    description: str
    branches: ExperimentListOut = []
    telemetry_enabled: int


class ProjectParamsOut(BaseModel):
    params: Dict
    metrics: List[str]


class ProjectActivityApiOut(BaseModel):
    num_experiments: int
    num_runs: int
    activity_map: Dict[str, int] = {"2021-01-01": 54}
