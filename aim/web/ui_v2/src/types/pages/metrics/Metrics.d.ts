import React from 'react';
import { RouteChildrenProps } from 'react-router-dom';

import { CurveEnum, XAlignmentEnum } from 'utils/d3';
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
  IAggregationConfig,
  IAggregatedData,
  IAlignmentConfig,
  IChartTooltip,
} from 'types/services/models/metrics/metricsAppModel';
import { ITableColumn } from 'types/components/TableColumns/TableColumns';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';
import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';
import { IBookmarkFormState } from 'types/components/BookmarkForm/BookmarkForm';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { ILine } from 'types/components/LineChart/LineChart';
import { ISelectMetricsOption } from './components/SelectForm/SelectForm';
import { RowHeight } from 'config/table/tableConfigs';

export interface IMetricProps extends Partial<RouteChildrenProps> {
  tableRef: React.RefObject<ITableRef>;
  chartPanelRef: React.RefObject<IChartPanelRef>;
  tableElemRef: React.RefObject<HTMLDivElement>;
  chartElemRef: React.RefObject<HTMLDivElement>;
  wrapperElemRef: React.RefObject<HTMLDivElement>;
  resizeElemRef: React.RefObject<HTMLDivElement>;
  lineChartData: ILine[][];
  tableData: IMetricTableRowData[];
  aggregatedData: IAggregatedData[];
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
  tooltip: IChartTooltip;
  aggregationConfig: IAggregationConfig;
  alignmentConfig: IAlignmentConfig;
  selectedMetricsData: IMetricAppConfig['select'];
  tableRowHeight: RowHeight;
  onChangeTooltip: (tooltip: Partial<IChartTooltip>) => void;
  onDisplayOutliersChange: () => void;
  onZoomModeChange: () => void;
  onActivePointChange?: (
    activePoint: IActivePoint,
    focusedStateActive?: boolean,
  ) => void;
  onHighlightModeChange: (mode: HighlightEnum) => void;
  onSmoothingChange: (props: IOnSmoothingChange) => void;
  onTableRowHover: (rowKey: string) => void;
  onTableRowClick: (rowKey?: string) => void;
  onAxesScaleTypeChange: (params: IAxesScaleState) => void;
  onAggregationConfigChange: (
    aggregationConfig: Partial<IAggregationConfig>,
  ) => void;
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
  onResetConfigData: () => void;
  onAlignmentMetricChange: (metric: string) => void;
  onAlignmentTypeChange: (type: XAlignmentEnum) => void;
  onMetricsSelectChange: (metrics: ISelectMetricsOption[]) => void;
  onSelectRunQueryChange: (query: string) => void;
  onSelectAdvancedQueryChange: (query: string) => void;
  toggleSelectAdvancedMode: () => void;
}

export interface IOnSmoothingChange {
  smoothingAlgorithm?: SmoothingAlgorithmEnum;
  smoothingFactor?: number;
  curveInterpolation?: CurveEnum;
}
