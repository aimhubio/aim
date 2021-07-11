export default interface ITableProps {
  onManageColumns?: () => void;
  onSort?: () => void;
  onRowsChange?: () => void;
  onExport?: () => void;
  onRowHeightChange?: () => void;
  data: any;
  navBarItems?: {
    name: string;
    callBack: () => void;
  }[];
}
