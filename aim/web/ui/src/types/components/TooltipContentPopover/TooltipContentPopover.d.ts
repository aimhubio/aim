import {
  ITooltip,
  IGroupingSelectOption,
  TooltipAppearance,
} from 'types/services/models/metrics/metricsAppModel';

export interface ITooltipContentPopoverProps {
  selectOptions: IGroupingSelectOption[];
  selectedFields?: string[];
  isTooltipDisplayed?: boolean;
  tooltipAppearance?: TooltipAppearance;
  onChangeTooltip: (tooltip: Partial<ITooltip>) => void;
}
