import { RowHeight, RowHeightSize } from 'config/table/tableConfigs';
import React from 'react';

export interface ITableProps {
  custom?: boolean;
  groups?: boolean;
  topHeader?: boolean;
  data: any[] | null;
  columns: any[];
  rowHeight: RowHeight;
  onManageColumns?: () => void;
  onSort?: () => void;
  onRowsChange?: () => void;
  onExport?: (e: React.ChangeEvent<any>) => void;
  onRowHeightChange?: (height: RowHeightSize) => void;
  data: any[];
  columns: any[];
  navBarItems?: {
    name: string;
    callBack: () => void;
  }[];
  rowHeight?: number;
  headerHeight?: number;
  sortOptions?: GroupingSelectOptionType[];
  fixed?: boolean;
  onRowHover?: (rowKey: string) => void;
  onRowClick?: (rowKey?: string) => void;
  hideHeaderActions?: boolean = false;
  emptyText?: string;
  excludedFields?: string[];
  setExcludedFields?: (fields: string[]) => null;
  alwaysVisibleColumns?: string[];
  rowHeightMode?: any;
  columnsOrder?: any;
  updateColumns?: any;
  columnsWidths?: any;
  updateColumnsWidths?: any;
  sortFields?: any;
  setSortFields?: any;
  isLoading?: boolean;
}

export interface ITableRef {
  updateData: (params: { newData?: any[]; newColumns?: any[] }) => void;
  setHoveredRow: (rowKey: string) => void;
  setActiveRow: (rowKey: string) => void;
  scrollToRow: (rowKey: string) => void;
}
