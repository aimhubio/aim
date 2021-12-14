import { IPoint } from 'components/ScatterPlot';

import { ILine } from 'types/components/LineChart/LineChart';

export interface IProcessedData extends ILine, IPoint {
  color: string;
  dasharray: string;
}

export interface IProcessLineChartData {
  min: { x: number; y: number };
  max: { x: number; y: number };
  processedData: IProcessedData[];
  xValues: number[];
  yValues: number[];
}
