import React from 'react';

export interface ILineChart {
  index?: number;
  width?: React.CSSProperties;
  height?: React.CSSProperties;
  data: number[][];
}
