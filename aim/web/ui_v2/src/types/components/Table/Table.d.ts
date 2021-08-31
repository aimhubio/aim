import { RowHeight } from 'config/table/tableConfigs';
import React from 'react';

export interface ITableProps {
  data: any[];
  columns: any[];
  rowHeight: RowHeight;
  onManageColumns?: () => void;
  onSort?: () => void;
  onRowsChange?: () => void;
  onExport?: (e: React.ChangeEvent<any>) => void;
  onRowHeightChange?: () => void;
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
}

export interface ITableRef {
  updateData: (params: { newData?: any[]; newColumns?: any[] }) => void;
  setHoveredRow: (rowKey: string) => void;
  setActiveRow: (rowKey: string) => void;
  scrollToRow: (rowKey: string) => void;
}
