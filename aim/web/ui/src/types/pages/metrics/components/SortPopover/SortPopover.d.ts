export interface ISortPopoverProps {
  onSort: any;
  onReset: () => void;
  sortOptions: SortFields;
  sortFields: SortFields;
  readOnlyFieldsLabel?: string;
}
export interface ISortPopoverListProps {
  onSort: any;
  sortFields: SortFields;
  title?: string;
}
