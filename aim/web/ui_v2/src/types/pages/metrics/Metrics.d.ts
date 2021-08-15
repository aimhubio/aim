import React from 'react';
import { RouteChildrenProps } from 'react-router-dom';

import { CurveEnum } from 'utils/d3';
import HighlightEnum from 'components/HighlightModesPopover/HighlightEnum';
import { SmoothingAlgorithmEnum } from 'utils/smoothingData';
import { ITableRef } from 'types/components/Table/Table';
import {
  GroupNameType,
  IMetricAppConfig,
  IMetricTableRowData,
  IOnGroupingModeChangeParams,
  IOnGroupingSelectChangeParams,
  IFocusedState,
  IMetricAppModelState,
  ITooltipContent,
} from 'types/services/models/metrics/metricsAppModel';
import { ITableColumn } from 'types/components/TableColumns/TableColumns';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';

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
  notifyData: IMetricAppModelState['notifyData'];
  tooltipContent: ITooltipContent;
  onDisplayOutliersChange: () => void;
  onZoomModeChange: () => void;
  onActivePointChange?: (
    activePoint: IActivePoint,
    focusedStateActive?: boolean,
  ) => void;
  onChangeHighlightMode: (mode: HighlightEnum) => void;
  onSmoothingChange: (props: IOnSmoothingChange) => void;
  onTableRowHover: (rowKey: string) => void;
  onTableRowClick: (rowKey: string) => void;
  onAxesScaleTypeChange: (params: IAxesScaleState) => void;
  onGroupingSelectChange: (params: IOnGroupingSelectChangeParams) => void;
  onGroupingModeChange: (params: IOnGroupingModeChangeParams) => void;
  onGroupingPaletteChange: (index: number) => void;
  onGroupingReset: (groupName: GroupNameType) => void;
  onGroupingApplyChange: (groupName: GroupNameType) => void;
  onGroupingPersistenceChange: (groupName: 'color' | 'style') => void;
  onBookmarkCreate: (params: IBookmarkFormState) => void;
  onBookmarkUpdate: (id: string) => void;
  onNotificationAdd: (notification: INotification) => void;
  onNotificationDelete: (id: number) => void;
}

export interface IOnSmoothingChange {
  smoothingAlgorithm?: SmoothingAlgorithmEnum;
  smoothingFactor?: number;
  curveInterpolation?: CurveEnum;
}
