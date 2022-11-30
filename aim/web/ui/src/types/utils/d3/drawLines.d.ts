import React from 'react';

import { IAggregationConfig } from 'types/services/models/metrics/metricsAppModel';

import { CurveEnum, HighlightEnum } from 'utils/d3';

import { IDrawAxesArgs } from './drawAxes';
import { IProcessedAggrData, IProcessedData } from './processLineChartData';

export interface IDrawLinesArgs {
  index: number;
  nameKey: string;
  linesRef: React.MutableRefObject<>;
  linesNodeRef: React.MutableRefObject<>;
  processedData: IProcessedData[];
  xScale: IDrawAxesArgs['xScale'];
  yScale: IDrawAxesArgs['yScale'];
  highlightMode: HighlightEnum;
  curveInterpolation: CurveEnum;
  aggregationConfig?: IAggregationConfig;
  processedAggrData?: IProcessedAggrData[];
  readOnly?: boolean;
}
