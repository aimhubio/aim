import React from 'react';

export interface IDrawLines {
  linesRef: React.MutableRefObject<>;
  data: number[][];
  strokeColor?: string;
}
