import { IRun } from './runModel';

export interface IMetric {
  run: IRun;
  key: string;
  metric_name: string;
  params: { [key: string]: any };
  data: {
    values: Float64Array;
    steps: Uint32Array;
    epochs: Uint32Array;
    iterations: Uint32Array;
    timestamp: Uint32Array;
    xValues: number[];
    yValues: number[];
  };
  color: string;
  dasharray: string;
}
