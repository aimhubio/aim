import React from 'react';

import { IPoint } from 'components/ScatterPlot';

import { Override } from 'types/utils/common';
import {
  IAggregatedData,
  IAggregationConfig,
} from 'types/services/models/metrics/metricsAppModel';
import { ILine } from 'types/components/LineChart/LineChart';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';

export interface IProcessedData extends ILine, IPoint {
  color: string;
  dasharray: string;
  data: [number, number][];
}

export type IProcessedAggrData = Override<
  IAggregatedData,
  {
    area: [number, number, number, number][];
    line: [number, number][];
  }
>;

export interface IProcessLineChartData {
  min: { x: number; y: number };
  max: { x: number; y: number };
  processedData: IProcessedData[];
  processedAggrData?: IProcessedAggrData[];
  allXValues: number[];
  allYValues: number[];
  xScale: any;
  yScale: any;
}

export interface IProcessLineChartDataArgs {
  data: ILine[];
  ignoreOutliers?: boolean;
  visBoxRef: React.MutableRefObject<any>;
  axesScaleType: IAxesScaleState;
  aggregatedData?: IAggregatedData[];
  aggregationConfig?: IAggregationConfig;
}

export interface ICalculateLineValues {
  values: [number, number][];
  xMin: number;
  xMax: number;
  minEdge: number;
  maxEdge: number;
  axesScaleType: IAxesScaleState;
}

export interface IGetValueInLine {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  x?: number;
  y?: number;
  axesScaleType: IAxesScaleState;
}
