import React from 'react';
import { IDrawAxesProps } from './drawAxes';
import { IProcessedData } from './processData';

export interface IDrawLinesProps {
  linesRef: React.MutableRefObject<>;
  data: IProcessedData[];
  xScale: IDrawAxesProps['xScale'];
  yScale: IDrawAxesProps['yScale'];
  index: number | undefined;
}
