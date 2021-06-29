import React from 'react';

export interface IDrawLinesProps {
  linesRef: React.MutableRefObject<>;
  data: number[][];
  strokeColor?: React.CSSProperties;
  xScale: any;
  yScale: any;
}
