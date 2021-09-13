import React from 'react';
import { RouteChildrenProps } from 'react-router-dom';

import { CurveEnum } from 'utils/d3';
import {
  GroupNameType,
  IChartTitleData,
  IChartTooltip,
  IFocusedState,
  IGroupingSelectOption,
  IMetricAppConfig,
  IOnGroupingModeChangeParams,
  IOnGroupingSelectChangeParams,
} from 'types/services/models/metrics/metricsAppModel';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { IParamsAppConfig } from 'types/services/models/params/paramsAppModel';
import { ITableRef } from 'components/Table/Table';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { IBookmarkFormState } from 'types/pages/metrics/components/BookmarkForm/BookmarkForm';

export interface IParamsProps extends Partial<RouteChildrenProps> {
  chartElemRef: React.RefObject<HTMLDivElement>;
  chartPanelRef: React.RefObject<IChartPanelRef>;
  tableRef: React.RefObject<ITableRef>;
  tableElemRef: React.RefObject<HTMLDivElement>;
  wrapperElemRef: React.RefObject<HTMLDivElement>;
  resizeElemRef: React.RefObject<HTMLDivElement>;
  curveInterpolation: CurveEnum;
  panelResizing: boolean;
  isParamsLoading: boolean;
  highPlotData: any;
  groupingData: IMetricAppConfig['grouping'];
  groupingSelectOptions: IGroupingSelectOption[];
  hiddenMetrics: string[];
  sortFields: [string, 'asc' | 'desc' | boolean][];
  notifyData: INotification[];
  onNotificationDelete: (id: number) => void;
  onCurveInterpolationChange: () => void;
  onActivePointChange: (
    activePoint: IActivePoint,
    focusedStateActive: boolean = false,
  ) => void;
  focusedState: IFocusedState;
  onColorIndicatorChange: () => void;
  isVisibleColorIndicator: boolean;
  tooltip: IChartTooltip;
  chartTitleData: IChartTitleData;
  onParamsSelectChange: IParamsAppConfig['onParamsSelectChange'];
  selectedParamsData: IParamsAppConfig['select'];
  requestIsPending: boolean;
  onSelectRunQueryChange: (query: string) => void;
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
  onChangeTooltip: (tooltip: Partial<IChartTooltip>) => void;
  onExportTableData: (e: React.ChangeEvent<any>) => void;
  onRowHeightChange: any;
  onSortFieldsChange: any;
  onParamVisibilityChange: any;
  onColumnsOrderChange: any;
  tableData: any;
  tableRowHeight?: any;
  onTableRowHover?: any;
  onTableRowClick?: any;
  tableColumns: any;
  tableRowHeight: any;
}
