from pydantic import BaseModel
from typing import Dict, List, Tuple, Optional, Union
from uuid import UUID


# response models
class EncodedNumpyArray(BaseModel):
    type: str = 'numpy'
    shape: int = 0
    dtype: str = 'float64'
    blob: bytes = ''


class TraceBase(BaseModel):
    context: dict
    name: str


class TraceOverview(TraceBase):
    last_value: float = 0.1


class TraceBaseView(TraceBase):
    iters: List[int]


class MetricsBaseView(TraceBaseView):
    values: List[float]


RunMetricsBatchApiOut = List[MetricsBaseView]


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
        description: str

    class Experiment(BaseModel):
        id: UUID
        name: str

    name: Optional[str] = None
    description: Optional[str] = None
    experiment: Optional[Experiment] = None
    tags: Optional[List[Tag]] = []
    creation_time: float
    end_time: Optional[float]
    archived: bool
    active: bool


class MetricSearchRunView(BaseModel):
    params: dict
    traces: List[TraceFullView]
    props: PropsView


class RunInfoOut(BaseModel):
    params: dict
    traces: Dict[str, List[TraceOverview]]
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
    name: str
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


class StructuredRunsArchivedOut(BaseModel):
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


class QuerySyntaxErrorOut(BaseModel):
    class SE(BaseModel):
        name: str
        statement: str
        line: int
        offset: int

    detail: SE


URIBatchIn = List[str]
RunsBatchIn = List[str]


# Custom object Models "Fully Generic"

class BaseRangeInfo(BaseModel):
    record_range_used: Tuple[int, int]
    record_range_total: Tuple[int, int]
    index_range_used: Optional[Tuple[int, int]]
    index_range_total: Optional[Tuple[int, int]]


class ObjectSequenceBaseView(BaseRangeInfo, TraceBaseView):
    values: list


class ObjectSequenceFullView(TraceBaseView):
    values: list
    iters: List[int]
    epochs: List[int]
    timestamps: List[float]


class ObjectSearchRunView(BaseModel):
    params: dict
    traces: List[ObjectSequenceFullView]
    ranges: BaseRangeInfo
    props: PropsView


# Custom objects
class ImageInfo(BaseModel):
    caption: str
    width: int
    height: int
    blob_uri: str
    index: int


class TextInfo(BaseModel):
    data: str
    index: int


class AudioInfo(BaseModel):
    caption: str
    blob_uri: str
    index: int


class DistributionInfo(BaseModel):
    data: EncodedNumpyArray
    bin_count: int
    range: Tuple[Union[int, float], Union[int, float]]


class FigureInfo(BaseModel):
    blob_uri: str


class NoteIn(BaseModel):
    content: str


ImageList = List[ImageInfo]
TextList = List[TextInfo]
AudioList = List[AudioInfo]
