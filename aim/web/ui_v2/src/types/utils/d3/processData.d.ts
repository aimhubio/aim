import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { ILine, ILineChartProps } from 'types/components/LineChart/LineChart';

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
  displayOutliers: boolean;
  axesScaleType: IAxesScaleState;
}

export interface IGetFilteredValuesParams {
  data: number[];
  invalidXIndices: number[];
  invalidYIndices: number[];
}
