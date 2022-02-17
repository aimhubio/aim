export interface IDataListProps {
  tableRef: React.RefObject<any>;
  data: any;
  isLoading?: boolean;
  withoutSearchBar?: boolean;
  tableColumns: any;
}
