import React from 'react';
import { RouteChildrenProps } from 'react-router-dom';

import { RowHeightSize } from 'config/table/tableConfigs';
import { ResizeModeEnum } from 'config/enums/tableEnums';
import { RequestStatusEnum } from 'config/enums/requestStatusEnum';

import {
  ISelectConfig,
  ISelectOption,
  IGroupingConfig,
  IColumnsOrder,
} from 'types/services/models/explorer/createAppModel';
import { IScatterAppModelState } from 'types/services/models/scatter/scatterAppModel';
import { ITableRef } from 'types/components/Table/Table';
import {
  GroupNameEnum,
  IMetricTableRowData,
  IOnGroupingModeChangeParams,
  IOnGroupingSelectChangeParams,
  IFocusedState,
  ITooltip,
  IChartTitleData,
  IGroupingSelectOption,
} from 'types/services/models/metrics/metricsAppModel';
import { ITableColumn } from 'types/components/TableColumns/TableColumns';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';
import { IBookmarkFormState } from 'types/components/BookmarkForm/BookmarkForm';
import {
  INotification,
  ISyntaxErrorDetails,
} from 'types/components/NotificationContainer/NotificationContainer';
import { IProjectParamsMetrics } from 'types/services/models/projects/projectsModel';
import { ITrendlineOptions } from 'types/services/models/scatter/scatterAppModel';

import { IRequestProgress } from 'utils/app/setRequestProgress';

export interface IScattersProps extends Partial<RouteChildrenProps> {
  tableRef: React.RefObject<ITableRef>;
  chartPanelRef: React.RefObject<IChartPanelRef>;
  tableElemRef: React.RefObject<HTMLDivElement>;
  chartElemRef: React.RefObject<HTMLDivElement>;
  wrapperElemRef: React.RefObject<HTMLDivElement>;
  resizeElemRef: React.RefObject<HTMLDivElement>;
  chartPanelOffsetHeight?: number;
  scatterPlotData: any[];
  panelResizing: boolean;
  chartTitleData: IChartTitleData;
  tableData: IMetricTableRowData[];
  tableColumns: ITableColumn[];
  focusedState: IFocusedState;
  groupingData: IGroupingConfig;
  notifyData: IScatterAppModelState['notifyData'];
  tooltip: ITooltip;
  selectedOptionsData: ISelectConfig;
  tableRowHeight: RowHeightSize;
  sortFields: [string, 'asc' | 'desc' | boolean][];
  hiddenMetrics: string[];
  hiddenColumns: string[];
  hideSystemMetrics: boolean;
  groupingSelectOptions: IGroupingSelectOption[];
  sortOptions: IGroupingSelectOption[];
  projectsDataMetrics: IProjectParamsMetrics['metrics'];
  resizeMode: ResizeModeEnum;
  selectFormData: {
    options: ISelectOption[];
    suggestions: string[];
    error: ISyntaxErrorDetails;
  };
  requestStatus: RequestStatusEnum;
  requestProgress: IRequestProgress;
  trendlineOptions: ITrendlineOptions;
  sameValueColumns?: string[] | [];
  selectedRows: { [key: string]: any };
  columnsOrder: IColumnsOrder;
  onChangeTooltip: (tooltip: Partial<ITooltip>) => void;
  onChangeTrendlineOptions: (options: Partial<ITrendlineOptions>) => void;
  onActivePointChange?: (
    activePoint: IActivePoint,
    focusedStateActive?: boolean,
  ) => void;
  onTableRowHover: (rowKey?: string) => void;
  onTableRowClick: (rowKey?: string) => void;
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
  onSelectOptionsChange: (options: ISelectOption[]) => void;
  onSelectRunQueryChange: (query: string) => void;
  onExportTableData: (e: React.ChangeEvent<any>) => void;
  onRowHeightChange: (height: RowHeightSize) => void;
  onSortReset: () => void;
  onSortChange?: (field: string, value?: 'asc' | 'desc' | 'none') => void;
  onParamVisibilityChange: (metricKeys: string[]) => void;
  onColumnsOrderChange: (order: any) => void;
  onColumnsVisibilityChange: (hiddenColumns: string[] | string) => void;
  onTableDiffShow: () => void;
  onTableResizeModeChange: (mode: ResizeModeEnum) => void;
  updateColumnsWidths: (key: string, width: number, isReset: boolean) => void;
  columnsWidths: { [key: string]: number };
  onShuffleChange: (name: 'stroke' | 'color') => void;
  onSearchQueryCopy: () => void;
  liveUpdateConfig: { delay: number; enabled: boolean };
  onRunsTagsChange: (runHash: string, tags: ITagInfo[]) => void;
  onLiveUpdateConfigChange: (config: {
    delay?: number;
    enabled?: boolean;
  }) => void;
  onRowSelect: any;
  archiveRuns: (ids: string[], archived: boolean) => void;
  deleteRuns: (ids: string[]) => void;
  onRowsVisibilityChange: (metricKeys: string[]) => void;
}
