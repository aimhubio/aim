import React from 'react';

import { IPoint } from 'components/ScatterPlot';

import { Override } from 'types/utils/common';
import {
  IAggregatedData,
  IAggregationConfig,
} from 'types/services/models/metrics/metricsAppModel';
import { ILine } from 'types/components/LineChart/LineChart';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { IAxesScaleRange } from 'types/components/AxesPropsPopover/AxesPropsPopover';

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
}

export interface IProcessLineChartDataArgs {
  data: ILine[];
  ignoreOutliers?: boolean;
  visBoxRef: React.MutableRefObject<any>;
  attributesRef: React.MutableRefObject<any>;
  axesScaleType: IAxesScaleState;
  axesScaleRange?: IAxesScaleRange;
  aggregatedData?: IAggregatedData[];
  aggregationConfig?: IAggregationConfig;
  unableToDrawConditions: Array<{ condition: boolean; text?: string }>;
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
