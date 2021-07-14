import React from 'react';

import { ILine, ILineChartProps } from '../LineChart/LineChart';

export interface IChartPanelProps {
  chartType: 'LineChart' | 'ParPlot' | 'ScatterPlot';
  data: ILine[][];
  chartProps: Omit<ILineChartProps, 'data' | 'index'>[];
  controls: React.ReactNode;
  classNames: {
    container: string;
    paper: string;
  };
}
