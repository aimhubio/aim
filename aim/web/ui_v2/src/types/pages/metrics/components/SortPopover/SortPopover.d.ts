import { IGroupingSelectOption } from 'types/services/models/metrics/metricsAppModel';

export interface ISortPopoverProps {
  onSort: (field: string, value?: 'asc' | 'desc' | 'none') => void;
  onReset: () => void;
  sortOptions: IGroupingSelectOption[];
  sortFields: [string, 'asc' | 'desc' | boolean][];
}
