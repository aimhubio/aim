export interface IDataListProps {
  tableRef: React.RefObject<any>;
  tableData: any;
  isLoading?: boolean;
  withSearchBar?: boolean;
  tableColumns: any;
  searchableKeys?: string[];
  illustrationConfig?: IIllustrationConfig;
}
