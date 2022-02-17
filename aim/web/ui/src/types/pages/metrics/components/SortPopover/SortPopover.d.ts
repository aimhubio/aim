import { AppNameEnum } from 'services/models/explorer';

import { SortFields } from 'utils/getSortedFields';

export interface ISortPopoverProps {
  onSort: any;
  onReset: () => void;
  sortOptions: SortFields;
  sortFields: SortFields;
  readOnlyFieldsLabel?: string;
  appName?: AppNameEnum;
}
export interface ISortPopoverListProps {
  onSort: any;
  sortFields: SortFields;
  filteredSortFields: SortFields;
  title?: string;
}
