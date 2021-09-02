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
    x_axis_values: Optional[EncodedNumpyArray] = None
    x_axis_iters: Optional[EncodedNumpyArray] = None


RunMetricCustomAlignApiOut = Dict[str, List[TraceAlignedView]]


class TraceFullView(TraceAlignedView):
    slice: Tuple[int, int, int]
    values: Optional[EncodedNumpyArray] = None
    iters: Optional[EncodedNumpyArray] = None
    epochs: Optional[EncodedNumpyArray] = None
    timestamps: Optional[EncodedNumpyArray] = None


class PropsView(BaseModel):
    class Tag(BaseModel):
        id: UUID
        name: str
        color: str

    class Experiment(BaseModel):
        id: UUID
        name: str

    name: Optional[str] = None
    experiment: Optional[Experiment] = None
    tags: Optional[List[Tag]] = []
    creation_time: float
    end_time: Optional[float]


class MetricSearchRunView(BaseModel):
    params: dict
    traces: List[TraceFullView]
    props: PropsView


class RunInfoOut(BaseModel):
    params: dict
    traces: List[TraceOverview]
    props: PropsView


RunMetricSearchApiOut = Dict[str, MetricSearchRunView]


class RunSearchRunView(BaseModel):
    params: dict
    traces: List[TraceOverview]
    props: PropsView


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
