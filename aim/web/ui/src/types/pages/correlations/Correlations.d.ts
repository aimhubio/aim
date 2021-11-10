import React from 'react';
import { RouteChildrenProps } from 'react-router-dom';

import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

import { RowHeightSize } from 'config/table/tableConfigs';
import { ResizeModeEnum } from 'config/enums/tableEnums';

import {
  ICorrelationAppConfig,
  ICorrelationAppModelState,
} from 'services/models/correlations/correlationsAppModel';

import { ITableRef } from 'types/components/Table/Table';
import {
  GroupNameType,
  IMetricAppConfig,
  IMetricTableRowData,
  IOnGroupingModeChangeParams,
  IOnGroupingSelectChangeParams,
  IFocusedState,
  IAggregationConfig,
  IChartTooltip,
  IChartTitleData,
  IGroupingSelectOption,
  IChartZoom,
} from 'types/services/models/metrics/metricsAppModel';
import { ITableColumn } from 'types/components/TableColumns/TableColumns';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';
import { IBookmarkFormState } from 'types/components/BookmarkForm/BookmarkForm';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { ILine } from 'types/components/LineChart/LineChart';
import { IProjectParamsMetrics } from 'types/services/models/projects/projectsModel';

export interface ICorrelationsProps extends Partial<RouteChildrenProps> {
  tableRef: React.RefObject<ITableRef>;
  chartPanelRef: React.RefObject<IChartPanelRef>;
  tableElemRef: React.RefObject<HTMLDivElement>;
  chartElemRef: React.RefObject<HTMLDivElement>;
  wrapperElemRef: React.RefObject<HTMLDivElement>;
  resizeElemRef: React.RefObject<HTMLDivElement>;
  scatterPlotData: ILine[][];
  panelResizing: boolean;
  chartTitleData: IChartTitleData;
  tableData: IMetricTableRowData[];
  tableColumns: ITableColumn[];
  ignoreOutliers: boolean;
  zoom: IChartZoom;
  axesScaleType: IAxesScaleState;
  focusedState: IFocusedState;
  highlightMode: HighlightEnum;
  groupingData: ICorrelationAppConfig['grouping'];
  notifyData: ICorrelationAppModelState['notifyData'];
  tooltip: IChartTooltip;
  selectedMetricsData: IMetricAppConfig['select'];
  tableRowHeight: RowHeightSize;
  sortFields: [string, 'asc' | 'desc' | boolean][];
  hiddenMetrics: string[];
  hiddenColumns: string[];
  groupingSelectOptions: IGroupingSelectOption[];
  projectsDataMetrics: IProjectParamsMetrics['metrics'];
  requestIsPending: boolean;
  resizeMode: ResizeModeEnum;
  onChangeTooltip: (tooltip: Partial<IChartTooltip>) => void;
  onIgnoreOutliersChange: () => void;
  onZoomChange: (zoom: Partial<IChartZoom>) => void;
  onActivePointChange?: (
    activePoint: IActivePoint,
    focusedStateActive?: boolean,
  ) => void;
  onHighlightModeChange: (mode: HighlightEnum) => void;
  onTableRowHover: (rowKey?: string) => void;
  onTableRowClick: (rowKey?: string) => void;
  onAxesScaleTypeChange: (params: IAxesScaleState) => void;
  onGroupingSelectChange: (params: IOnGroupingSelectChangeParams) => void;
  onGroupingModeChange: (params: IOnGroupingModeChangeParams) => void;
  onGroupingPaletteChange: (index: number) => void;
  onGroupingReset: (groupName: GroupNameType) => void;
  onGroupingApplyChange: (groupName: GroupNameType) => void;
  onGroupingPersistenceChange: (groupName: 'color' | 'stroke') => void;
  onBookmarkCreate: (params: IBookmarkFormState) => void;
  onBookmarkUpdate: (id: string) => void;
  onNotificationAdd: (notification: INotification) => void;
  onNotificationDelete: (id: number) => void;
  onResetConfigData: () => void;
  onMetricsSelectChange: IMetricAppConfig['onMetricsSelectChange'];
  onSelectRunQueryChange: (query: string) => void;
  onSelectAdvancedQueryChange: (query: string) => void;
  toggleSelectAdvancedMode: () => void;
  onExportTableData: (e: React.ChangeEvent<any>) => void;
  onRowHeightChange: (height: RowHeightSize) => void;
  onSortReset: () => void;
  onSortChange?: (field: string, value?: 'asc' | 'desc' | 'none') => void;
  onMetricVisibilityChange: (metricKeys: string[]) => void;
  onColumnsOrderChange: (order: any) => void;
  onColumnsVisibilityChange: (hiddenColumns: string[]) => void;
  onTableDiffShow: () => void;
  onTableResizeModeChange: (mode: ResizeModeEnum) => void;
  updateColumnsWidths: (key: string, width: number, isReset: boolean) => void;
  columnsWidths: { [key: string]: number };
  onShuffleChange: (name: 'stroke' | 'color') => void;
  onSearchQueryCopy: () => void;
  liveUpdateConfig: { delay: number; enabled: boolean };
  onLiveUpdateConfigChange: (config: {
    delay?: number;
    enabled?: boolean;
  }) => void;
}
