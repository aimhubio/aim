import { ILineChartProps } from '../../components/LineChart/LineChart';

export interface IProcessDataProps {
  data: ILineChartProps['data'];
}

export interface IProcessData {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xSteps: number[];
  yValues: number[];
}
