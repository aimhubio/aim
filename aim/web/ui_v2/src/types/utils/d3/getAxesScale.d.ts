import * as d3 from 'd3';
import React from 'react';
import { ILineChartProps } from '../../components/LineChart/LineChart';

export interface IGetAxisScaleProps {
  visBoxRef: React.MutableRefObject<>;
  axisScaleType: ILineChartProps['axisScaleType'];
  min: { x: number; y: number };
  max: { x: number; y: number };
}

export type IScale = d3.ScaleLogarithmic | d3.ScaleLinear;

export interface IGetAxisScale {
  xScale: IScale;
  yScale: IScale;
}
