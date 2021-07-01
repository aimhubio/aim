import { ILine, ILineChartProps } from '../../components/LineChart/LineChart';

export interface IProcessDataProps {
  data: ILineChartProps['data'];
}

export interface IProcessData {
  min: { x: number; y: number };
  max: { x: number; y: number };
  processedData: ILine[];
}
