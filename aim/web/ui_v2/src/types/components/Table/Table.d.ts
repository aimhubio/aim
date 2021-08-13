import { RowHeight } from 'config/table/tableConfigs';

export interface ITableProps {
  data: any[];
  columns: any[];
  rowHeight: RowHeight;
  onManageColumns?: () => void;
  onSort?: () => void;
  onRowsChange?: () => void;
  onExport?: () => void;
  onRowHeightChange?: () => void;
  onRowHover: (rowKey: string) => void;
  onRowClick: (rowKey: string) => void;
}

export interface ITableRef {
  updateData: (params: { newData?: any[]; newColumns?: any[] }) => void;
  setHoveredRow: (rowKey: string) => void;
  setActiveRow: (rowKey: string) => void;
  scrollToRow: (rowKey: string) => void;
}
