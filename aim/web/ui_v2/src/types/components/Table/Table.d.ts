export interface ITableProps {
  onManageColumns?: () => void;
  onSort?: () => void;
  onRowsChange?: () => void;
  onExport?: () => void;
  onRowHeightChange?: () => void;
  data: any[];
  columns: any[];
  navBarItems?: {
    name: string;
    callBack: () => void;
  }[];
  onRowHover: (rowKey: string) => void;
}

export interface ITableRef {
  updateData: (params: { newData?: any[]; newColumns?: any[] }) => void;
  setHoveredRow: (rowKey: string) => void;
}
