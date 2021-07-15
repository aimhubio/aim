import { IRun } from './runModel';

export interface IMetric {
  run: IRun;
  key: string;
  metric_name: string;
  context: { [key: string]: unknown };
  data: {
    values: Float64Array;
    steps: Uint32Array;
    epochs: Uint32Array;
    iterations: Uint32Array;
    timestamp: Uint32Array;
  };
  color: string;
  dasharray: string;
  selectors: string[];
}
