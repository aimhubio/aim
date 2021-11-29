import React from 'react';

import {
  IAlignmentConfig,
  IFocusedState,
  ITooltipContent,
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
  focusedState: IFocusedState;
  chartType: ChartTypeEnum;
  alignmentConfig?: IAlignmentConfig;
  reCreatePopover?: unknown;
}
