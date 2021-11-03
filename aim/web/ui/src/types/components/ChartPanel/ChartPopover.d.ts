import React from 'react';

import { PopoverPosition } from '@material-ui/core';

import {
  IAlignmentConfig,
  IFocusedState,
  ITooltipContent,
} from 'services/models/metrics/metricsAppModel';

import { ChartTypeEnum } from 'utils/d3';

export interface IChartPopover {
  children?: React.ReactNode;
  popoverPosition: PopoverPosition | null;
  open: boolean;
  className?: string;
  id?: string;
  containerRef?: React.RefObject<HTMLDivElement>;
  tooltipContent: ITooltipContent;
  focusedState: IFocusedState;
  chartType: ChartTypeEnum;
  alignmentConfig?: IAlignmentConfig;
}
