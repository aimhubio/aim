import { IGroupingSelectOption } from 'types/services/models/metrics/metricsAppModel';

export interface ISortPopoverProps {
  sortOptions: IGroupingSelectOption[];
  sortFields: [string, 'asc' | 'desc' | boolean][];
  onSort: (fields: [string, 'asc' | 'desc' | boolean][]) => void;
}
