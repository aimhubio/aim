import React from 'react';

export interface ILineChartProps {
  index?: number;
  width?: React.CSSProperties;
  height?: React.CSSProperties;
  data: number[][];
  xAlignment: 'absolute_time' | 'relative_time' | 'epoch';
  xScaleType?: 'log' | 'linear';
  yScaleType?: 'log' | 'linear';
  strokeColor?: React.CSSProperties;
}
