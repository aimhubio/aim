from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Union, Tuple, Optional
from uuid import UUID


class ExploreState(BaseModel):
    class Chart(BaseModel):
        class Focused(BaseModel):
            class Metric(BaseModel):
                runHash: Optional[str] = None
                metricName: Optional[str] = None
                traceContext: Optional[str] = None

            class Circle(BaseModel):
                active: Optional[bool] = None
                runHash: Optional[str] = None
                metricName: Optional[str] = None
                traceContext: Optional[str] = None
                step: Optional[int] = None
                param: Optional[str] = None
                contentType: Optional[str] = None

            metric: Optional[Metric] = None
            circle: Optional[Circle] = None
            step: Optional[int] = None

        class Settings(BaseModel):
            class Persistent(BaseModel):
                displayOutliers: Optional[bool] = None
                zoom: Optional[Dict[str, Dict[str, Tuple[int, int]]]] = None
                interpolate: Optional[bool] = None
                indicator: Optional[bool] = None
                xAlignment: Optional[Union[str, Tuple[str]]] = None
                xScale: Optional[int] = None
                yScale: Optional[int] = None
                pointsCount: Optional[int] = None
                smoothingAlgorithm: Optional[str] = None
                smoothFactor: Optional[Union[float, int]] = None
                aggregated: Optional[bool] = None

            zoomMode: Optional[bool] = None
            singleZoomMode: Optional[bool] = None
            zoomHistory: Optional[List[Tuple[str, Dict[str, Tuple[int, int]]]]] = None
            highlightMode: Optional[str] = None
            persistent: Optional[Persistent] = None

        class TooltipOptions(BaseModel):
            display: Optional[bool] = None
            fields: Optional[List] = None

        focused: Optional[Focused] = None
        settings: Optional[Settings] = None
        tooltipOptions: Optional[TooltipOptions] = None
        hiddenMetrics: Optional[List[str]] = None

    class Search(BaseModel):
        query: Optional[str] = None
        v: Optional[int] = None

    class SearchInput(BaseModel):
        value: Optional[str] = None
        selectInput: Optional[str] = None
        selectConditionInput: Optional[str] = None

    class ContextFilter(BaseModel):
        class GroupAgainst(BaseModel):
            color: Optional[bool] = None
            style: Optional[bool] = None
            chart: Optional[bool] = None

        class Seed(BaseModel):
            color: Optional[int] = None
            style: Optional[int] = None

        class Persist(BaseModel):
            color: Optional[int] = None
            style: Optional[int] = None

        groupByColor: Optional[List[str]] = None
        groupByStyle: Optional[List[str]] = None
        groupByChart: Optional[List[str]] = None
        aggregatedArea: Optional[str] = None
        aggregatedLine: Optional[str] = None
        groupAgainst: Optional[GroupAgainst] = None
        seed: Optional[Seed] = None
        persist: Optional[Persist] = None

    class Screen(BaseModel):
        viewMode: Optional[str] = None
        panelFlex: Optional[Union[float, int]] = None

    class Table(BaseModel):
        class ColumnsOrder(BaseModel):
            left: Optional[List[str]] = None
            middle: Optional[List[str]] = None
            right: Optional[List[str]] = None

        columnsOrder: Optional[ColumnsOrder] = None
        rowHeightMode: Optional[str] = None
        columnsWidths: Optional[Dict[str, int]] = None
        excludedFields: Optional[List[str]] = None

    chart: Optional[Chart] = None
    search: Optional[Search] = None
    searchInput: Optional[SearchInput] = None
    contextFilter: Optional[ContextFilter] = None
    colorPalette: Optional[int] = None
    sortFields: Optional[List[Tuple[str, str]]] = None
    screen: Optional[Screen] = None
    table: Optional[Table] = None


class ExploreStateOut(BaseModel):
    id: UUID
    updated_at: datetime = 'Wed, 01 Jan 2021 16:12:07 GMT'
    created_at: datetime = 'Wed, 01 Jan 2021 16:12:07 GMT'
    app_state: ExploreState
