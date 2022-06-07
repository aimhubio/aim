import {
  IPanelTooltip,
  IGroupingSelectOption,
} from 'types/services/models/metrics/metricsAppModel';

export interface ITooltipContentPopoverProps {
  selectOptions: IGroupingSelectOption[];
  selectedFields: string[];
  displayTooltip: boolean;
  onChangeTooltip: (tooltip: Partial<IPanelTooltip>) => void;
}
