import React from 'react';

import { RowHeight, RowHeightSize } from 'config/table/tableConfigs';
import {
  MetricsValueKeyEnum,
  ResizeModeEnum,
  VisualizationElementEnum,
} from 'config/enums/tableEnums';

import { AppNameEnum } from 'services/models/explorer';

import { IMetricProps } from 'types/pages/metrics/Metrics';
import { IColumnsOrder } from 'types/services/models/explorer/createAppModel';

import { IIllustrationBlockProps } from '../IllustrationBlock/IllustrationBlock';

export interface ITableProps {
  custom?: boolean;
  groups?: boolean;
  topHeader?: boolean;
  data: any[] | null;
  columns: any[];
  sameValueColumns?: string[] | [];
  height?: string;
  metricsValueKey?: MetricsValueKeyEnum;
  rowHeight?: RowHeight;
  estimatedRowHeight?: number;
  onManageColumns?: (order: IColumnsOrderData) => void;
  onColumnsVisibilityChange?: (hiddenColumns: string[] | string) => void;
  hiddenChartRows?: boolean;
  onTableDiffShow?: () => void;
  onSort?: (field: string, value: 'asc' | 'desc' | 'none') => void;
  onSortReset?: () => void;
  onRowsChange?: (keys: string[]) => void;
  onExport?: (e: React.ChangeEvent<any>) => void;
  onRowHeightChange?: (height: RowHeightSize) => void;
  onMetricsValueKeyChange?: (key: MetricsValueKeyEnum) => void;
  onTableResizeModeChange?: IMetricProps['onTableResizeModeChange'];
  navBarItems?: {
    name: string;
    callBack: () => void;
  }[];
  className?: string;
  headerHeight?: number;
  sortOptions?: GroupingSelectOptionType[];
  fixed?: boolean;
  onRowHover?: (rowKey: string) => void;
  onRowClick?: (rowKey?: string) => void;
  hideHeaderActions?: boolean;
  excludedFields?: string[];
  setExcludedFields?: (fields: string[]) => null;
  alwaysVisibleColumns?: string[];
  rowHeightMode?: any;
  columnsOrder?: IColumnsOrder;
  hiddenColumns?: string[];
  hideSystemMetrics?: boolean;
  updateColumns?: any;
  columnsWidths?: any;
  updateColumnsWidths?: any;
  sortFields?: any;
  hiddenRows?: string[];
  setSortFields?: any;
  isLoading?: boolean;
  infiniteLoadHandler?: (data: any) => void;
  isInfiniteLoading?: boolean;
  allowInfiniteLoading?: boolean;
  showRowClickBehaviour?: boolean;
  showResizeContainerActionBar?: boolean;
  resizeMode?: ResizeModeEnum;
  multiSelect?: boolean;
  selectedRows?: any;
  minHeight?: string;
  onRowSelect?: any;
  archiveRuns?: (ids: string[], archived: boolean) => void;
  deleteRuns?: (ids: string[]) => void;
  onRowsVisibilityChange?: (keys: string[]) => void;
  onToggleColumnsColorScales?: (colKey: string) => void;
  appName?: AppNameEnum;
  focusedState?: any;
  illustrationConfig?: IIllustrationConfig;
  disableRowClick?: boolean;
  columnsColorScales?: { [key: string]: boolean };
  visualizationElementType?: VisualizationElementEnum;
  noColumnActions?: boolean;
}

export interface ITableRef {
  updateData: (params: {
    newData?: any[];
    newColumns?: any[];
    hiddenColumns?: string[] | string;
  }) => void;
  setHoveredRow: (rowKey: string) => void;
  setActiveRow: (rowKey: string) => void;
  scrollToRow: (rowKey: string) => void;
}

export interface IColumnsOrderData {
  left: string[];
  middle: string[];
  right: string[];
}

export interface IIllustrationConfig {
  size?: IIllustrationBlockProps['size'];
  page?: IIllustrationBlockProps['page'];
  type?: IIllustrationBlockProps['type'];
  title?: IIllustrationBlockProps['title'];
  content?: IIllustrationBlockProps['content'];
  showImage?: IIllustrationBlockProps['showImage'];
}
