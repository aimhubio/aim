import {
  IFocusedState,
  ITooltipContent,
} from 'types/services/models/metrics/metricsAppModel';
import { ChartTypeEnum } from 'utils/d3';

export interface IPopoverContentProps {
  tooltipContent: ITooltipContent;
  focusedState: IFocusedState;
  chartType: ChartTypeEnum;
}
