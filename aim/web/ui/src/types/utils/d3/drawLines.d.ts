import React from 'react';

import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

import {
  IAggregatedData,
  IAggregationConfig,
} from 'types/services/models/metrics/metricsAppModel';

import { CurveEnum } from 'utils/d3';

import { IDrawAxesArgs } from './drawAxes';
import { IProcessedData } from './processLineChartData';

export interface IDrawLinesArgs {
  index: number;
  linesRef: React.MutableRefObject<>;
  linesNodeRef: React.MutableRefObject<>;
  data: IProcessedData[];
  xScale: IDrawAxesArgs['xScale'];
  yScale: IDrawAxesArgs['yScale'];
  highlightMode: HighlightEnum;
  curveInterpolation: CurveEnum;
  aggregationConfig?: IAggregationConfig;
  aggregatedData?: IAggregatedData[];
}
