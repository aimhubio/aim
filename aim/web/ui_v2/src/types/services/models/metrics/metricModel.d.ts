import { IRun } from './runModel';

export interface IMetric {
  run: IRun;
  key: string;
  metric_name: string;
  context: { [key: string]: unknown };
  data: {
    values: Float64Array;
    epochs: Float64Array;
    iterations: Float64Array;
    timestamps: Float64Array;
    xValues: number[];
    yValues: number[];
  };
  color: string;
  dasharray: string;
  selectors: string[];
}
