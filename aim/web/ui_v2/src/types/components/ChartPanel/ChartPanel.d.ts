import React from 'react';

import { ILine, ILineChartProps } from '../LineChart/LineChart';
import { IActivePointData } from 'types/utils/d3/drawHoverAttributes';

export interface IChartPanelProps {
  chartType: 'LineChart' | 'ParPlot' | 'ScatterPlot';
  data: ILine[][];
  chartProps: Omit<ILineChartProps, 'data' | 'index' | 'onMouseOver'>[];
  controls: React.ReactNode;
  onActivePointChange?: (activePointData: IActivePointData) => void;
}

export interface IChartPanelRef {
  setActiveLine: (rowKey: string) => void;
}
