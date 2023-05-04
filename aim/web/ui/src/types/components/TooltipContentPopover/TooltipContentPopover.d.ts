import { TooltipAppearanceEnum } from 'modules/BaseExplorer/components/Controls/ConfigureTooltip';

import {
  ITooltip,
  IGroupingSelectOption,
} from 'types/services/models/metrics/metricsAppModel';

export interface ITooltipContentPopoverProps {
  selectOptions: IGroupingSelectOption[];
  selectedFields?: string[];
  isTooltipDisplayed?: boolean;
  tooltipAppearance?: TooltipAppearanceEnum;
  onChangeTooltip: (tooltip: Partial<ITooltip>) => void;
}
