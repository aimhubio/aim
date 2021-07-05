import * as d3 from 'd3';
import React from 'react';
import { ILineChartProps } from '../../components/LineChart/LineChart';

export interface IGetAxisScaleProps {
  visBoxRef: React.MutableRefObject<>;
  axisScaleType: ILineChartProps['axisScaleType'];
  min: { x: number; y: number };
  max: { x: number; y: number };
}

export interface IGetAxisScale {
  xScale: d3.ScaleLogarithmic | d3.ScaleLinear;
  yScale: d3.ScaleLogarithmic | d3.ScaleLinear;
}
