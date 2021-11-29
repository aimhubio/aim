import React from 'react';
import { RouteChildrenProps } from 'react-router-dom';

import { ITableRef } from 'components/Table/Table';

import { ResizeModeEnum } from 'config/enums/tableEnums';

import {
  GroupNameType,
  IChartTitleData,
  IPanelTooltip,
  IFocusedState,
  IGroupingSelectOption,
  IMetricAppConfig,
  IOnGroupingModeChangeParams,
  IOnGroupingSelectChangeParams,
} from 'types/services/models/metrics/metricsAppModel';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { IParamsAppConfig } from 'types/services/models/params/paramsAppModel';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { IBookmarkFormState } from 'types/components/BookmarkForm/BookmarkForm';

import { CurveEnum } from 'utils/d3';

export interface IParamsProps extends Partial<RouteChildrenProps> {
  chartElemRef: React.RefObject<HTMLDivElement>;
  chartPanelRef: React.RefObject<IChartPanelRef>;
  tableRef: React.RefObject<ITableRef>;
  tableElemRef: React.RefObject<HTMLDivElement>;
  wrapperElemRef: React.RefObject<HTMLDivElement>;
  resizeElemRef: React.RefObject<HTMLDivElement>;
  curveInterpolation: CurveEnum;
  panelResizing: boolean;
  requestIsPending: boolean;
  highPlotData: any;
  groupingData: IMetricAppConfig['grouping'];
  groupingSelectOptions: IGroupingSelectOption[];
  hiddenMetrics: string[];
  sortFields: [string, 'asc' | 'desc' | boolean][];
  focusedState: IFocusedState;
  isVisibleColorIndicator: boolean;
  tooltip: IPanelTooltip;
  chartTitleData: IChartTitleData;
  selectedParamsData: IParamsAppConfig['select'];
  onRowHeightChange: any;
  onSortFieldsChange: any;
  onParamVisibilityChange: any;
  onColumnsOrderChange: any;
  tableData: any;
  onTableRowHover?: (rowKey?: string) => void;
  onTableRowClick?: (rowKey?: string) => void;
  tableColumns: any;
  resizeMode: ResizeModeEnum;
  notifyData: INotification[];
  tableRowHeight?: any;
  hiddenColumns: any;
  onNotificationDelete: (id: number) => void;
  onCurveInterpolationChange: () => void;
  onActivePointChange: (
    activePoint: IActivePoint,
    focusedStateActive: boolean = false,
  ) => void;
  onColorIndicatorChange: () => void;
  onParamsSelectChange: IParamsAppConfig['onParamsSelectChange'];
  onSelectRunQueryChange: (query: string) => void;
  onGroupingSelectChange: (params: IOnGroupingSelectChangeParams) => void;
  onGroupingModeChange: (params: IOnGroupingModeChangeParams) => void;
  onGroupingPaletteChange: (index: number) => void;
  onGroupingReset: (groupName: GroupNameType) => void;
  onGroupingApplyChange: (groupName: GroupNameType) => void;
  onGroupingPersistenceChange: (groupName: 'color' | 'stroke') => void;
  onBookmarkCreate: (params: IBookmarkFormState) => void;
  onBookmarkUpdate: (id: string) => void;
  onNotificationAdd: (notification: INotification) => void;
  onResetConfigData: () => void;
  onChangeTooltip: (tooltip: Partial<IPanelTooltip>) => void;
  onExportTableData: (e: React.ChangeEvent<any>) => void;
  onColumnsVisibilityChange: (order: any) => void;
  onTableDiffShow: () => void;
  onTableResizeModeChange: (mode: ResizeModeEnum) => void;
  onSortReset: () => void;
  updateColumnsWidths: (key: string, width: number, isReset: boolean) => void;
  onShuffleChange: (name: 'stroke' | 'color') => void;
  columnsWidths: { [key: string]: number };
  liveUpdateConfig: { delay: number; enabled: boolean };
  onLiveUpdateConfigChange: (config: {
    delay?: number;
    enabled?: boolean;
  }) => void;
}
