import React from 'react';
import { RouteChildrenProps } from 'react-router-dom';

import { ITableRef } from 'components/Table/Table';

import { ResizeModeEnum } from 'config/enums/tableEnums';
import { RequestStatusEnum } from 'config/enums/requestStatusEnum';

import {
  GroupNameEnum,
  IChartTitleData,
  ITooltip,
  IFocusedState,
  IGroupingSelectOption,
  IOnGroupingModeChangeParams,
  IOnGroupingSelectChangeParams,
} from 'types/services/models/metrics/metricsAppModel';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import {
  INotification,
  ISyntaxErrorDetails,
} from 'types/components/NotificationContainer/NotificationContainer';
import { IBookmarkFormState } from 'types/components/BookmarkForm/BookmarkForm';
import {
  IColumnsOrder,
  IGroupingConfig,
  ISelectConfig,
  ISelectOption,
} from 'types/services/models/explorer/createAppModel';

import { CurveEnum } from 'utils/d3';
import { IRequestProgress } from 'utils/app/setRequestProgress';

export interface IParamsProps extends Partial<RouteChildrenProps> {
  chartElemRef: React.RefObject<HTMLDivElement>;
  chartPanelRef: React.RefObject<IChartPanelRef>;
  tableRef: React.RefObject<ITableRef>;
  tableElemRef: React.RefObject<HTMLDivElement>;
  wrapperElemRef: React.RefObject<HTMLDivElement>;
  resizeElemRef: React.RefObject<HTMLDivElement>;
  chartPanelOffsetHeight?: number;
  curveInterpolation: CurveEnum;
  panelResizing: boolean;
  requestStatus: RequestStatusEnum;
  requestProgress: IRequestProgress;
  highPlotData: any;
  groupingData: IGroupingConfig;
  groupingSelectOptions: IGroupingSelectOption[];
  sortOptions: IGroupingSelectOption[];
  hiddenMetrics: string[];
  hideSystemMetrics: boolean;
  sortFields: [string, 'asc' | 'desc' | boolean][];
  focusedState: IFocusedState;
  isVisibleColorIndicator: boolean;
  tooltip: ITooltip;
  chartTitleData: IChartTitleData;
  selectedParamsData: ISelectConfig;
  onRowHeightChange: any;
  onSortFieldsChange: any;
  onParamVisibilityChange: any;
  onColumnsOrderChange: any;
  tableData: any;
  selectedRows: { [key: string]: any };
  brushExtents: {
    [key: string]: {
      [key: string]: [number, number] | [string, string];
    };
  };
  onTableRowHover?: (rowKey?: string) => void;
  onTableRowClick?: (rowKey?: string) => void;
  tableColumns: any;
  resizeMode: ResizeModeEnum;
  notifyData: INotification[];
  tableRowHeight?: any;
  hiddenColumns: any;
  selectFormData: {
    options: ISelectOption[];
    suggestions: string[];
    error: ISyntaxErrorDetails;
  };
  columnsOrder: IColumnsOrder;
  sameValueColumns: string[] | [];
  onNotificationDelete: (id: number) => void;
  onCurveInterpolationChange: () => void;
  onActivePointChange: (
    activePoint: IActivePoint,
    focusedStateActive: boolean = false,
  ) => void;
  onColorIndicatorChange: () => void;
  onParamsSelectChange: (options: ISelectOption[]) => void;
  onSelectRunQueryChange: (query: string) => void;
  onGroupingSelectChange: (params: IOnGroupingSelectChangeParams) => void;
  onGroupingModeChange: (params: IOnGroupingModeChangeParams) => void;
  onGroupingPaletteChange: (index: number) => void;
  onGroupingReset: (groupName: GroupNameEnum) => void;
  onGroupingApplyChange: (groupName: GroupNameEnum) => void;
  onGroupingPersistenceChange: (groupName: 'color' | 'stroke') => void;
  onBookmarkCreate: (params: IBookmarkFormState) => void;
  onBookmarkUpdate: (id: string) => void;
  onNotificationAdd: (notification: INotification) => void;
  onResetConfigData: () => void;
  onChangeTooltip: (tooltip: Partial<ITooltip>) => void;
  onExportTableData: (e: React.ChangeEvent<any>) => void;
  onColumnsVisibilityChange: (order: any) => void;
  onTableDiffShow: () => void;
  onTableResizeModeChange: (mode: ResizeModeEnum) => void;
  onSortReset: () => void;
  updateColumnsWidths: (key: string, width: number, isReset: boolean) => void;
  onRunsTagsChange: (runHash: string, tags: ITagInfo[]) => void;
  onShuffleChange: (name: 'stroke' | 'color') => void;
  onAxisBrushExtentChange: (
    key: string,
    extent: [number, number] | [string, string] | null,
    chartIndex: number,
  ) => void;
  columnsWidths: { [key: string]: number };
  liveUpdateConfig: { delay: number; enabled: boolean };
  onLiveUpdateConfigChange: (config: {
    delay?: number;
    enabled?: boolean;
  }) => void;
  onRowSelect: any;
  archiveRuns: (ids: string[], archived: boolean) => void;
  deleteRuns: (ids: string[]) => void;
  onRowsVisibilityChange: (metricKeys: string[]) => void;
}
