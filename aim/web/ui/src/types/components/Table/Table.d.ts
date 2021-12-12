import React from 'react';

import { RowHeight, RowHeightSize } from 'config/table/tableConfigs';
import { ResizeModeEnum } from 'config/enums/tableEnums';

import { IMetricProps } from 'types/pages/metrics/Metrics';

export interface ITableProps {
  custom?: boolean;
  groups?: boolean;
  topHeader?: boolean;
  data: any[] | null;
  columns: any[];
  height?: string;
  rowHeight?: RowHeight;
  estimatedRowHeight?: number;
  onManageColumns?: (order: any) => void;
  onColumnsVisibilityChange?: (hiddenColumns: string[]) => void;
  onTableDiffShow?: () => void;
  onSort?: (field: string, value: 'asc' | 'desc' | 'none') => void;
  onSortReset?: () => void;
  onRowsChange?: (keys: string[]) => void;
  onExport?: (e: React.ChangeEvent<any>) => void;
  onRowHeightChange?: (height: RowHeightSize) => void;
  onTableResizeModeChange?: IMetricProps['onTableResizeModeChange'];
  navBarItems?: {
    name: string;
    callBack: () => void;
  }[];
  headerHeight?: number;
  sortOptions?: GroupingSelectOptionType[];
  fixed?: boolean;
  onRowHover?: (rowKey: string) => void;
  onRowClick?: (rowKey?: string) => void;
  hideHeaderActions?: boolean;
  emptyText?: string;
  excludedFields?: string[];
  setExcludedFields?: (fields: string[]) => null;
  alwaysVisibleColumns?: string[];
  rowHeightMode?: any;
  columnsOrder?: any;
  hiddenColumns?: string[];
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
}

export interface ITableRef {
  updateData: (params: { newData?: any[]; newColumns?: any[] }) => void;
  setHoveredRow: (rowKey: string) => void;
  setActiveRow: (rowKey: string) => void;
  scrollToRow: (rowKey: string) => void;
}
