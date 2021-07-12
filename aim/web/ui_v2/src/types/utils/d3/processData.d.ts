import { ILine, ILineChartProps } from '../../components/LineChart/LineChart';

export interface IProcessedData extends ILine {
  color: string;
  dasharray: string;
}

export interface IProcessData {
  min: { x: number; y: number };
  max: { x: number; y: number };
  processedData: IProcessedData[];
}

export interface IProcessDataProps {
  data: ILineChartProps['data'];
}
