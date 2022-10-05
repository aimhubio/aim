import React from 'react';

import { IGroupingSelectOption } from 'types/services/models/imagesExplore/imagesExploreAppModel';
import {
  IAlignmentConfig,
  IFocusedState,
  ITooltipContent,
  TooltipAppearance,
} from 'types/services/models/metrics/metricsAppModel';

import { ChartTypeEnum } from 'utils/d3';

export interface IChartPopover {
  id?: string;
  children?: React.ReactNode;
  activePointRect: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  } | null;
  open: boolean;
  className?: string;
  containerNode?: HTMLDivElement | null;
  tooltipContent: ITooltipContent;
  tooltipAppearance?: TooltipAppearance;
  focusedState: IFocusedState;
  chartType: ChartTypeEnum;
  alignmentConfig?: IAlignmentConfig;
  reCreatePopover?: unknown;
  onRunsTagsChange: (runHash: string, tags: ITagInfo[]) => void;
  selectOptions: IGroupingSelectOption[];
  onChangeTooltip: (tooltip: ITooltip) => void;
}
