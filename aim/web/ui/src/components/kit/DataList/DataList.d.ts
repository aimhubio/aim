export interface IDataListProps {
  tableRef: React.RefObject<any>;
  tableData: any;
  isLoading?: boolean;
  withSearchBar?: boolean;
  calcTableHeight?: boolean;
  tableColumns: any;
  searchableKeys?: string[];
  illustrationConfig?: IIllustrationConfig;
}
