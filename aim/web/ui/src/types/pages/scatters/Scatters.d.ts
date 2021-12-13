import React from 'react';
import { RouteChildrenProps } from 'react-router-dom';

import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

import { RowHeightSize } from 'config/table/tableConfigs';
import { ResizeModeEnum } from 'config/enums/tableEnums';

import { IScatterAppModelState } from 'services/models/scatter/scatterAppModel';
import {
  ISelectConfig,
  ISelectOption,
} from 'services/models/explorer/createAppModel';
import { IGroupingConfig } from 'services/models/explorer/createAppModel';

import { ITableRef } from 'types/components/Table/Table';
import {
  GroupNameType,
  IMetricTableRowData,
  IOnGroupingModeChangeParams,
  IOnGroupingSelectChangeParams,
  IFocusedState,
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
import { IProjectParamsMetrics } from 'types/services/models/projects/projectsModel';

export interface IScattersProps extends Partial<RouteChildrenProps> {
  tableRef: React.RefObject<ITableRef>;
  chartPanelRef: React.RefObject<IChartPanelRef>;
  tableElemRef: React.RefObject<HTMLDivElement>;
  chartElemRef: React.RefObject<HTMLDivElement>;
  wrapperElemRef: React.RefObject<HTMLDivElement>;
  resizeElemRef: React.RefObject<HTMLDivElement>;
  scatterPlotData: any[];
  panelResizing: boolean;
  chartTitleData: IChartTitleData;
  tableData: IMetricTableRowData[];
  tableColumns: ITableColumn[];
  focusedState: IFocusedState;
  groupingData: IGroupingConfig;
  notifyData: IScatterAppModelState['notifyData'];
  tooltip: IChartTooltip;
  selectedOptionsData: ISelectConfig;
  tableRowHeight: RowHeightSize;
  sortFields: [string, 'asc' | 'desc' | boolean][];
  hiddenMetrics: string[];
  hiddenColumns: string[];
  groupingSelectOptions: IGroupingSelectOption[];
  projectsDataMetrics: IProjectParamsMetrics['metrics'];
  requestIsPending: boolean;
  resizeMode: ResizeModeEnum;
  onChangeTooltip: (tooltip: Partial<IChartTooltip>) => void;
  onActivePointChange?: (
    activePoint: IActivePoint,
    focusedStateActive?: boolean,
  ) => void;
  onTableRowHover: (rowKey?: string) => void;
  onTableRowClick: (rowKey?: string) => void;
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
  onSelectOptionsChange: (options: ISelectOption[]) => void;
  onSelectRunQueryChange: (query: string) => void;
  onExportTableData: (e: React.ChangeEvent<any>) => void;
  onRowHeightChange: (height: RowHeightSize) => void;
  onSortReset: () => void;
  onSortChange?: (field: string, value?: 'asc' | 'desc' | 'none') => void;
  onParamVisibilityChange: (metricKeys: string[]) => void;
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
