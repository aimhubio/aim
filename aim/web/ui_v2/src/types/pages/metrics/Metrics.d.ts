import React from 'react';
import { RouteChildrenProps } from 'react-router-dom';

import { CurveEnum } from 'utils/d3';
import { ITableRef } from 'types/components/Table/Table';
import {
  groupNames,
  IMetricAppConfig,
  IMetricTableRowData,
  IOnGroupingModeChangeParams,
  IOnGroupingSelectChangeParams,
  IFocusedState,
} from 'types/services/models/metrics/metricsAppModel';
import { ITableColumn } from './components/TableColumns/TableColumns';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import HighlightEnum from 'components/HighlightModesPopover/HighlightEnum';
import { SmoothingAlgorithmEnum } from 'utils/smoothingData';
import { IActivePoint } from '../../utils/d3/drawHoverAttributes';

export interface IMetricProps extends Partial<RouteChildrenProps> {
  tableRef: React.RefObject<ITableRef>;
  chartPanelRef: React.RefObject<IChartPanelRef>;
  tableElemRef: React.RefObject<HTMLDivElement>;
  chartElemRef: React.RefObject<HTMLDivElement>;
  wrapperElemRef: React.RefObject<HTMLDivElement>;
  resizeElemRef: React.RefObject<HTMLDivElement>;
  lineChartData: ILine[][];
  tableData: IMetricTableRowData[][];
  tableColumns: ITableColumn[];
  displayOutliers: boolean;
  zoomMode: boolean;
  curveInterpolation: CurveEnum;
  axesScaleType: IAxesScaleState;
  smoothingAlgorithm: SmoothingAlgorithmEnum;
  smoothingFactor: number;
  focusedState: IFocusedState;
  highlightMode: HighlightEnum;
  groupingData: IMetricAppConfig['grouping'];
  onDisplayOutliersChange: () => void;
  onZoomModeChange: () => void;
  onFocusedStateChange?: (
    activePoint: IActivePoint,
    focusedStateActive?: boolean,
  ) => void;
  onChangeHighlightMode: (mode: HighlightEnum) => void;
  onSmoothingChange: (props: IOnSmoothingChange) => void;
  onTableRowHover: (rowKey: string) => void;
  onAxesScaleTypeChange: (params: IAxesScaleState) => void;
  onGroupingSelectChange: (params: IOnGroupingSelectChangeParams) => void;
  onGroupingModeChange: (params: IOnGroupingModeChangeParams) => void;
  onGroupingPaletteChange: (index: number) => void;
  onGroupingReset: (groupName: groupNames) => void;
  onGroupingApplyChange: (groupName: groupNames) => void;
  onGroupingPersistenceChange: (groupName: 'color' | 'style') => void;
}

export interface IOnSmoothingChange {
  smoothingAlgorithm?: SmoothingAlgorithmEnum;
  smoothingFactor?: number;
  curveInterpolation?: CurveEnum;
}
