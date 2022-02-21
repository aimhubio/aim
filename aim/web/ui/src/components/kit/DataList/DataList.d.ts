export interface IDataListProps {
  tableRef: React.RefObject<any>;
  tableData: any;
  isLoading?: boolean;
  withoutSearchBar?: boolean;
  tableColumns: any;
  searchableKeys?: string[];
}
