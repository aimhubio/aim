from pydantic import BaseModel
from typing import Dict, List, Tuple


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
