import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';

export interface IFilterMetricDataParams {
  values: number[];
  steps: number[];
  epochs: number[];
  timestamps: number[];
  axesScaleType?: IAxesScaleState;
  xAxisValues?: number[] | null;
  xAxisIters?: number[] | null;
  alignMetric?: string | null;
}
