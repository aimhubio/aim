export default interface ITableProps {
  onManageColumns?: () => void;
  onSort?: () => void;
  onRowsChange?: () => void;
  onExport?: () => void;
  onRowHeightChange?: () => void;
  navBarItems?: {
    name: string;
    callBack: () => void;
  }[];
}
