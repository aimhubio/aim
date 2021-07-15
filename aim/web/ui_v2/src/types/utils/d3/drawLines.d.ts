import React from 'react';
import { IDrawAxesProps } from './drawAxes';
import { IProcessedData } from './processData';
import { CurveEnum } from 'utils/d3';

export interface IDrawLinesProps {
  linesRef: React.MutableRefObject<>;
  linesNodeRef: React.MutableRefObject<>;
  data: IProcessedData[];
  xScale: IDrawAxesProps['xScale'];
  yScale: IDrawAxesProps['yScale'];
  curveInterpolation: CurveEnum;
  index: number | undefined;
}
