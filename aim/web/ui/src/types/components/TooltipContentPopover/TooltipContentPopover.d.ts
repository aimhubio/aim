import {
  IChartTooltip,
  IGroupingSelectOption,
} from 'types/services/models/metrics/metricsAppModel';

export interface ITooltipContentPopoverProps {
  selectOptions: IGroupingSelectOption[];
  selectedParams: string[];
  displayTooltip: boolean;
  onChangeTooltip: (tooltip: Partial<IChartTooltip>) => void;
}
