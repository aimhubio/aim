import {
  IAlignmentConfig,
  IFocusedState,
  IGroupingSelectOption,
  ITooltipContent,
  TooltipAppearance,
} from 'types/services/models/metrics/metricsAppModel';

import { ChartTypeEnum } from 'utils/d3';

export interface IPopoverContentProps {
  tooltipContent: ITooltipContent;
  tooltipAppearance?: TooltipAppearance;
  focusedState: IFocusedState;
  chartType: ChartTypeEnum;
  alignmentConfig?: IAlignmentConfig;
  selectOptions: IGroupingSelectOption[];
  onRunsTagsChange: (runHash: string, tags: ITagInfo[]) => void;
  onChangeTooltip?: (tooltip: ITooltip) => void;
}
