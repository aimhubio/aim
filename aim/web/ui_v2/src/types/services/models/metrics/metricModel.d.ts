import { IMetricTrace, IRun } from './runModel';

export interface IMetric {
  run: IRun<IMetricTrace>;
  key: string;
  metric_name: string;
  context: { [key: string]: unknown };
  data: {
    values: number[];
    steps: number[];
    epochs: number[];
    timestamps: number[];
    xValues: number[];
    yValues: number[];
  };
  color: string;
  dasharray: string;
}
