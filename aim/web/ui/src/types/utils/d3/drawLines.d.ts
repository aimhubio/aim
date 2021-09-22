import React from 'react';
import { IDrawAxesProps } from './drawAxes';
import { IProcessedData } from './processData';
import { CurveEnum } from 'utils/d3';
import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';
import {
  IAggregatedData,
  IAggregationConfig,
} from 'types/services/models/metrics/metricsAppModel';

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
