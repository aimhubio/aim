import { IGroupingSelectOption } from 'types/services/models/metrics/metricsAppModel';
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
  sortOptions: IGroupingSelectOption[];
  onRowHover: (rowKey: string) => void;
  onRowClick: (rowKey?: string) => void;
}

export interface ITableRef {
  updateData: (params: { newData?: any[]; newColumns?: any[] }) => void;
  setHoveredRow: (rowKey: string) => void;
  setActiveRow: (rowKey: string) => void;
  scrollToRow: (rowKey: string) => void;
}
