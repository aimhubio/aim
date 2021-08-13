from pydantic import BaseModel
from typing import Dict, List, Tuple, Optional
from uuid import UUID


# response models
class EncodedNumpyArray(BaseModel):
    type: str = 'numpy'
    shape: int = 0
    dtype: str = 'float64'
    blob: bytes = ''


class TraceBase(BaseModel):
    context: dict
    metric_name: str


class TraceOverview(TraceBase):
    last_value: float = 0.1


RunTracesApiOut = List[TraceOverview]


class TraceBaseView(TraceBase):
    values: List[float]
    iters: List[int]


RunTracesBatchApiOut = List[TraceBaseView]


class TraceAlignedView(TraceBase):
    x_axis_values: EncodedNumpyArray
    x_axis_iters: EncodedNumpyArray


RunMetricCustomAlignApiOut = Dict[str, List[TraceAlignedView]]


class TraceFullView(TraceAlignedView):
    slice: Tuple[int, int, int]
    values: EncodedNumpyArray
    iters: EncodedNumpyArray
    epochs: EncodedNumpyArray
    timestamps: EncodedNumpyArray


class MetricSearchRunView(BaseModel):
    params: dict
    traces: List[TraceFullView]
    created_at: float = 0.1


RunMetricSearchApiOut = Dict[str, MetricSearchRunView]


class RunSearchRunView(BaseModel):
    params: dict
    traces: List[TraceOverview]
    created_at: float = 0.1


RunSearchApiOut = Dict[str, RunSearchRunView]


# request models
class AlignedTraceIn(BaseModel):
    context: dict
    metric_name: str
    slice: Tuple[int, int, int]


class AlignedRunIn(BaseModel):
    run_id: str
    traces: List[AlignedTraceIn]


class MetricAlignApiIn(BaseModel):
    align_by: str
    runs: List[AlignedRunIn]


RunTracesBatchApiIn = List[TraceBase]


# structured run models
class StructuredRunUpdateIn(BaseModel):
    name: Optional[str] = ''
    description: Optional[str] = ''
    archived: Optional[bool] = None
    experiment: Optional[str] = ''


class StructuredRunUpdateOut(BaseModel):
    id: str
    status: str = 'OK'


class StructuredRunBaseOut(BaseModel):
    id: str
    name: str


StructuredRunListOut = List[StructuredRunBaseOut]


class StructuredRunOut(StructuredRunBaseOut):
    class Experiment(BaseModel):
        experiment_id: UUID
        name: str = ''

    class Tag(BaseModel):
        tag_id: UUID
        name: str = ''

    archived: bool = False
    description: str = ''
    experiment: Optional[Experiment] = ''
    tags: Optional[List[Tag]] = []


class StructuredRunAddTagIn(BaseModel):
    tag_name: str


class StructuredRunAddTagOut(BaseModel):
    id: str
    tag_id: UUID
    status: str = 'OK'


class StructuredRunRemoveTagOut(BaseModel):
    id: str
    removed: bool
    status: str = 'OK'
