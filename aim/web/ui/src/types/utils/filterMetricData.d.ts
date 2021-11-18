import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';

export interface IFilterMetricDataParams {
  values?: number[];
  steps: number[];
  epochs: number[];
  timestamps: number[];
  axesScaleType?: IAxesScaleState;
}
