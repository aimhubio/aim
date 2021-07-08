import { ILine, ILineChartProps } from '../../components/LineChart/LineChart';

export interface IProcessDataProps {
  data: ILineChartProps['data'];
  displayOutliers: boolean;
}

export interface IProcessedData extends ILine {
  data: [number, number][];
}

export interface IProcessData {
  min: { x: number; y: number };
  max: { x: number; y: number };
  processedData: IProcessedData[];
  xValues: number[];
  yValues: number[];
}

export interface IProcessDataProps {
  data: ILineChartProps['data'];
}
