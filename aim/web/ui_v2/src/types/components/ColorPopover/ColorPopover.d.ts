import { IMetricProps } from 'types/pages/metrics/Metrics';

export interface IColorPopoverProps {
  selectOptions: string[];
  selectedValues: string[];
  onSelect: IMetricProps['onGroupingSelectChange'];
}
