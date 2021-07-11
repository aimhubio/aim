import React from 'react';
import { IDrawAxesProps } from './drawAxes';
import { IProcessData } from './processData';

export interface IDrawLinesProps {
  linesRef: React.MutableRefObject<>;
  data: IProcessData['processedData'];
  xScale: IDrawAxesProps['xScale'];
  yScale: IDrawAxesProps['yScale'];
  index: number | undefined;
}
