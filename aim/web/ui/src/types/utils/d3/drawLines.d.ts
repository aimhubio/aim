import React from 'react';

import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

import {
  IAggregatedData,
  IAggregationConfig,
} from 'types/services/models/metrics/metricsAppModel';

import { CurveEnum } from 'utils/d3';

import { IDrawAxesProps } from './drawAxes';
import { IProcessedData } from './processData';

export interface IDrawLinesProps {
  index: number;
  linesRef: React.MutableRefObject<>;
  linesNodeRef: React.MutableRefObject<>;
  data: IProcessedData[];
  xScale: IDrawAxesProps['xScale'];
  yScale: IDrawAxesProps['yScale'];
  highlightMode: HighlightEnum;
  curveInterpolation: CurveEnum;
  aggregationConfig?: IAggregationConfig;
  aggregatedData?: IAggregatedData[];
}
