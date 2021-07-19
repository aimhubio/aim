import React from 'react';

import { ILine, ILineChartProps } from '../LineChart/LineChart';
import { IActivePointData } from 'types/utils/d3/drawHoverAttributes';
import { ChartTypeEnum } from 'utils/d3';

export interface IChartPanelProps {
  chartType: ChartTypeEnum;
  data: ILine[][];
  chartProps: Omit<ILineChartProps, 'data' | 'index' | 'onMouseOver'>[];
  controls: React.ReactNode;
  onActivePointChange?: (activePointData: IActivePointData) => void;
}

export interface IChartPanelRef {
  setActiveLine: (rowKey: string) => void;
}
