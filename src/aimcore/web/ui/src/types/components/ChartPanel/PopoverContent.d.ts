import {
  ITooltipConfig,
  TooltipAppearanceEnum,
} from 'modules/BaseExplorer/components/Controls/ConfigureTooltip';

import {
  IAlignmentConfig,
  IFocusedState,
  IGroupingSelectOption,
  ITooltipContent,
} from 'types/services/models/metrics/metricsAppModel';
import { ITagInfo } from 'types/pages/tags/Tags';

import { ChartTypeEnum } from 'utils/d3';

export interface IPopoverContentProps {
  tooltipContent: ITooltipContent;
  tooltipAppearance?: TooltipAppearanceEnum;
  focusedState: IFocusedState;
  chartType: ChartTypeEnum;
  alignmentConfig?: IAlignmentConfig;
  selectOptions: IGroupingSelectOption[];
  onRunsTagsChange: (runHash: string, tags: ITagInfo[]) => void;
  onChangeTooltip?: (tooltip: Partial<ITooltipConfig>) => void;
}
