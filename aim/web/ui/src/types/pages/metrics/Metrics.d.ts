import React from 'react';
import { RouteChildrenProps } from 'react-router-dom';

import { RowHeightSize } from 'config/table/tableConfigs';
import { ResizeModeEnum } from 'config/enums/tableEnums';
import { DensityOptions } from 'config/enums/densityEnum';
import { RequestStatusEnum } from 'config/enums/requestStatusEnum';

import {
  IGroupingConfig,
  ISelectConfig,
} from 'services/models/explorer/createAppModel';
import { ISelectOption } from 'services/models/explorer/createAppModel';

import { ITableRef } from 'types/components/Table/Table';
import {
  GroupNameEnum,
  IMetricTableRowData,
  IOnGroupingModeChangeParams,
  IOnGroupingSelectChangeParams,
  IFocusedState,
  IMetricAppModelState,
  IAggregationConfig,
  IAggregatedData,
  IAlignmentConfig,
  ITooltip,
  IChartTitleData,
  IGroupingSelectOption,
  IChartZoom,
  ISmoothing,
  LegendsDataType,
  LegendsConfig,
} from 'types/services/models/metrics/metricsAppModel';
import { ITableColumn } from 'types/components/TableColumns/TableColumns';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';
import { IBookmarkFormState } from 'types/components/BookmarkForm/BookmarkForm';
import {
  INotification,
  ISyntaxErrorDetails,
} from 'types/components/NotificationContainer/NotificationContainer';
import { ILine } from 'types/components/LineChart/LineChart';
import { IAxesScaleRange } from 'types/components/AxesPropsPopover/AxesPropsPopover';
import { IColumnsOrder } from 'types/services/models/explorer/createAppModel';
import { ITagInfo } from 'types/tags/Tags';

import { HighlightEnum } from 'utils/d3';
import { IRequestProgress } from 'utils/app/setRequestProgress';

export interface IMetricProps extends Partial<RouteChildrenProps> {
  tableRef: React.RefObject<ITableRef>;
  chartPanelRef: React.RefObject<IChartPanelRef>;
  tableElemRef: React.RefObject<HTMLDivElement>;
  chartElemRef: React.RefObject<HTMLDivElement>;
  wrapperElemRef: React.RefObject<HTMLDivElement>;
  resizeElemRef: React.RefObject<HTMLDivElement>;
  chartPanelOffsetHeight?: number;
  lineChartData: ILine[][];
  panelResizing: boolean;
  chartTitleData: IChartTitleData;
  legendsData: LegendsDataType;
  tableData: IMetricTableRowData[];
  aggregatedData: IAggregatedData[];
  tableColumns: ITableColumn[];
  ignoreOutliers: boolean;
  legends: LegendsConfig;
  zoom: IChartZoom;
  densityType: DensityOptions;
  axesScaleType: IAxesScaleState;
  axesScaleRange: IAxesScaleRange;
  smoothing: ISmoothing;
  focusedState: IFocusedState;
  highlightMode: HighlightEnum;
  groupingData: IGroupingConfig;
  notifyData: IMetricAppModelState['notifyData'];
  tooltip: ITooltip;
  aggregationConfig: IAggregationConfig;
  alignmentConfig: IAlignmentConfig;
  selectedMetricsData: ISelectConfig;
  tableRowHeight: RowHeightSize;
  selectedRows: { [key: string]: any };
  sortFields: [string, 'asc' | 'desc' | boolean][];
  hiddenMetrics: string[];
  hiddenColumns: string[];
  hideSystemMetrics: boolean;
  sameValueColumns?: string[] | [];
  groupingSelectOptions: IGroupingSelectOption[];
  sortOptions: IGroupingSelectOption[];
  requestStatus: RequestStatusEnum;
  requestProgress: IRequestProgress;
  resizeMode: ResizeModeEnum;
  selectFormData: {
    options: ISelectOption[];
    suggestions: string[];
    error: ISyntaxErrorDetails;
    advancedError: ISyntaxErrorDetails;
  };
  columnsOrder: IColumnsOrder;
  onRunsTagsChange: (runHash: string, tags: ITagInfo[]) => void;
  onChangeTooltip: (tooltip: Partial<ITooltip>) => void;
  onIgnoreOutliersChange: () => void;
  onLegendsChange: (legends: Partial<LegendsConfig>) => void;
  onZoomChange: (zoom: Partial<IChartZoom>) => void;
  onActivePointChange?: (
    activePoint: IActivePoint,
    focusedStateActive?: boolean,
  ) => void;
  onHighlightModeChange: (mode: HighlightEnum) => void;
  onSmoothingChange: (args: Partial<ISmoothing>) => void;
  onTableRowHover: (rowKey?: string) => void;
  onTableRowClick: (rowKey?: string) => void;
  onAxesScaleTypeChange: (params: IAxesScaleState) => void;
  onAxesScaleRangeChange: (range: Partial<IAxesScaleRange>) => void;
  onAggregationConfigChange: (
    aggregationConfig: Partial<IAggregationConfig>,
  ) => void;
  onGroupingSelectChange: (params: IOnGroupingSelectChangeParams) => void;
  onGroupingModeChange: (params: IOnGroupingModeChangeParams) => void;
  onGroupingPaletteChange: (index: number) => void;
  onGroupingReset: (groupName: GroupNameEnum) => void;
  onGroupingApplyChange: (groupName: GroupNameEnum) => void;
  onGroupingPersistenceChange: (groupName: 'color' | 'stroke') => void;
  onBookmarkCreate: (params: IBookmarkFormState) => void;
  onBookmarkUpdate: (id: string) => void;
  onNotificationAdd: (notification: INotification) => void;
  onNotificationDelete: (id: number) => void;
  onResetConfigData: () => void;
  onAlignmentMetricChange: (metric: string) => void;
  onAlignmentTypeChange: (type: XAlignmentEnum) => void;
  onDensityTypeChange: (type: DensityOptions) => void;
  onMetricsSelectChange: (options: ISelectOption[]) => void;
  onSelectRunQueryChange: (query: string) => void;
  onSelectAdvancedQueryChange: (query: string) => void;
  onRowsVisibilityChange: (metricKeys: string[]) => void;
  toggleSelectAdvancedMode: () => void;
  onExportTableData: (e: React.ChangeEvent<any>) => void;
  onRowHeightChange: (height: RowHeightSize) => void;
  onSortReset: () => void;
  onSortChange?: (field: string, value?: 'asc' | 'desc' | 'none') => void;
  onMetricVisibilityChange: (metricKeys: string[]) => void;
  onColumnsOrderChange: (order: any) => void;
  onColumnsVisibilityChange: (hiddenColumns: string[] | string) => void;
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
  onRowSelect: any;
  archiveRuns: (ids: string[], archived: boolean) => void;
  deleteRuns: (ids: string[]) => void;
}
