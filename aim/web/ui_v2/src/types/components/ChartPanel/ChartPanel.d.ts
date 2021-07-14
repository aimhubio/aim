import React from 'react';

import { ILine, ILineChartProps } from '../LineChart/LineChart';

export interface IChartPanelProps {
  chartType: 'LineChart' | 'ParPlot' | 'ScatterPlot';
  data: ILine[][];
  chartProps: Omit<ILineChartProps, 'data' | 'index' | 'onMouseOver'>[];
  controls: React.ReactNode;
}
