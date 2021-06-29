import React from 'react';
import { ILineChartProps } from '../../components/LineChart/LineChart';

export interface IDrawAxesProps {
  xScaleType: ILineChartProps['xScaleType'];
  yScaleType: ILineChartProps['yScaleType'];
  xAlignment: ILineChartProps['xAlignment'];
  axesRef: React.MutableRefObject<>;
  plotBoxRef: React.MutableRefObject<>;
  visBoxRef: React.MutableRefObject<>;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface IDrawAxes {
  xScale: any;
  yScale: any;
}
