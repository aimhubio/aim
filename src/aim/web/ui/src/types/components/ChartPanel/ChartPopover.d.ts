import React from 'react';

import { TooltipAppearanceEnum } from 'modules/BaseExplorer/components/Controls/ConfigureTooltip';

import { IGroupingSelectOption } from 'types/services/models/imagesExplore/imagesExploreAppModel';
import {
  IAlignmentConfig,
  IFocusedState,
  ITooltip,
  ITooltipContent,
} from 'types/services/models/metrics/metricsAppModel';
import { ITagInfo } from 'types/pages/tags/Tags';

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
  forceOpen?: boolean;
  className?: string;
  containerNode?: HTMLDivElement | null;
  tooltipContent: ITooltipContent;
  tooltipAppearance?: TooltipAppearanceEnum;
  focusedState: IFocusedState;
  chartType: ChartTypeEnum;
  alignmentConfig?: IAlignmentConfig;
  onRunsTagsChange: (runHash: string, tags: ITagInfo[]) => void;
  selectOptions: IGroupingSelectOption[];
  onChangeTooltip: (tooltip: ITooltip) => void;
}
