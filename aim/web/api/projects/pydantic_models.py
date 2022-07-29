from pydantic import BaseModel
from typing import Dict, List, Optional


class ProjectApiOut(BaseModel):
    name: str
    path: str
    description: str
    telemetry_enabled: int


class ProjectParamsOut(BaseModel):
    params: Dict
    metric: Optional[Dict[str, list]] = None
    images: Optional[Dict[str, list]] = None
    texts: Optional[Dict[str, list]] = None
    figures: Optional[Dict[str, list]] = None
    distributions: Optional[Dict[str, list]] = None
    audios: Optional[Dict[str, list]] = None


class ProjectActivityApiOut(BaseModel):
    num_experiments: int
    num_runs: int
    activity_map: Dict[str, int] = {"2021-01-01": 54}


class ProjectPinnedMetricsApiOut(BaseModel):
    metrics: List[str] = []


class ProjectPinnedMetricsApiIn(BaseModel):
    metrics: List[str]
