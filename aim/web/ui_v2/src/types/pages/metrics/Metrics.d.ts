import React from 'react';
import { RouteChildrenProps } from 'react-router-dom';

import { CurveEnum } from 'utils/d3';
import { ITableRef } from 'types/components/Table/Table';
import { IMetricTableRowData } from 'types/services/models/metrics/metricsAppModel';
import { ITableColumn } from './components/TableColumns/TableColumns';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import HighlightEnum from 'components/HighlightModesPopover/HighlightEnum';
import { SmoothingAlgorithmEnum } from 'utils/smoothingData';

export interface IMetricProps extends Partial<RouteChildrenProps> {
  lineChartData: ILine[][];
  tableData: IMetricTableRowData[][];
  tableColumns: ITableColumn[];
  tableRef: React.RefObject<ITableRef>;
  chartPanelRef: React.RefObject<IChartPanelRef>;
  tableElemRef: React.RefObject<HTMLDivElement>;
  chartElemRef: React.RefObject<HTMLDivElement>;
  wrapperElemRef: React.RefObject<HTMLDivElement>;
  resizeElemRef: React.RefObject<HTMLDivElement>;
  displayOutliers: boolean;
  zoomMode: boolean;
  curveInterpolation: CurveEnum;
  onDisplayOutliersChange: () => void;
  onZoomModeChange: () => void;
  onActivePointChange: (activePointData: IActivePointData) => void;
  highlightMode: HighlightEnum;
  onChangeHighlightMode: (mode: HighlightEnum) => void;
  onSmoothingChange: (props: IOnSmoothingChange) => void;
  onTableRowHover: (rowKey: string) => void;
  curveInterpolation: CurveEnum;
  onAxesScaleTypeChange: (params: IAxesScaleState) => void;
  axesScaleType: IAxesScaleState;
  smoothingAlgorithm: SmoothingAlgorithmEnum;
  smoothingFactor: number;
}

export interface IOnSmoothingChange {
  smoothingAlgorithm?: string;
  smoothingFactor?: number;
  curveInterpolation?: CurveEnum;
}
