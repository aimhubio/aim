import { ILine } from 'types/components/LineChart/LineChart';

export interface IProcessedData extends ILine {
  color: string;
  dasharray: string;
}

export interface IProcessData {
  min: { x: number; y: number };
  max: { x: number; y: number };
  processedData: IProcessedData[];
  xValues: number[];
  yValues: number[];
}
