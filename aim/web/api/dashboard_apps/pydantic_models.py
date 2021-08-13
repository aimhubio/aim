from pydantic import BaseModel
from pydantic.main import ModelMetaclass
from typing import List, Dict, Union, Tuple, Optional
from uuid import UUID


class AllOptional(ModelMetaclass):
    def __new__(self, name, bases, namespaces, **kwargs):
        annotations = namespaces.get('__annotations__', {})
        for base in bases:
            annotations = {**annotations, **base.__annotations__}
        for field in annotations:
            if not field.startswith('__'):
                annotations[field] = Optional[annotations[field]]
        namespaces['__annotations__'] = annotations
        return super().__new__(self, name, bases, namespaces, **kwargs)


class ExploreState(BaseModel, metaclass=AllOptional):
    class Chart(BaseModel):
        class Focused(BaseModel):
            class Metric(BaseModel):
                runHash: str = None
                metricName: str = None
                traceContext: str = None

            class Circle(BaseModel):
                active: bool = None
                runHash: str = None
                metricName: str = None
                traceContext: str = None
                step: int = None
                param: str = None
                contentType: str = None

            metric: Metric = None
            circle: Circle = None
            step: int = None

        class Settings(BaseModel):
            class Persistent(BaseModel):
                displayOutliers: bool = None
                zoom: Dict[str, Dict[str, Tuple[int, int]]] = None
                interpolate: bool = None
                indicator: bool = None
                xAlignment: Union[str, Tuple[str]] = None
                xScale: int = None
                yScale: int = None
                pointsCount: int = None
                smoothingAlgorithm: str = None
                smoothFactor: Union[int, float] = None
                aggregated: bool = None

            zoomMode: bool = None
            singleZoomMode: bool = None
            zoomHistory: List[Tuple[str, Dict[str, Tuple[int, int]]]] = None
            highlightMode: str = None
            persistent: Persistent = None

        class TooltipOptions(BaseModel):
            display: bool = None
            fields: List = None

        focused: Focused = None
        settings: Settings = None
        tooltipOptions: TooltipOptions = None
        hiddenMetrics: List[str] = None

    class Search(BaseModel):
        query: str = None
        v: int = None

    class SearchInput(BaseModel):
        value: str = None
        selectInput: str = None
        selectConditionInput: str = None

    class ContextFilter(BaseModel):
        class GroupAgainst(BaseModel):
            color: bool = None
            style: bool = None
            chart: bool = None

        class Seed(BaseModel):
            color: int = None
            style: int = None

        class Persist(BaseModel):
            color: int = None
            style: int = None

        groupByColor: List[str] = None
        groupByStyle: List[str] = None
        groupByChart: List[str] = None
        aggregatedArea: str = None
        aggregatedLine: str = None
        groupAgainst: GroupAgainst = None
        seed: Seed = None
        persist: Persist = None

    class Screen(BaseModel):
        viewMode: str = None
        panelFlex: Union[int, float] = None

    class Table(BaseModel):
        class ColumnsOrder(BaseModel):
            left: List[str] = None
            middle: List[str] = None
            right: List[str] = None

        columnsOrder: ColumnsOrder = None
        rowHeightMode: str = None
        columnsWidths: Dict[str, int] = None
        excludedFields: List[str] = None

    chart: Chart = None
    search: Search = None
    searchInput: SearchInput = None
    contextFilter: ContextFilter = None
    colorPalette: int = None
    sortFields: List[Tuple[str, str]] = None
    screen: Screen = None
    table: Table = None


class ExploreStateOut(BaseModel):
    id: UUID
    updated_at: str = 'Wed, 01 Jan 2021 16:12:07 GMT'
    created_at: str = 'Wed, 01 Jan 2021 16:12:07 GMT'
    app_state: ExploreState
