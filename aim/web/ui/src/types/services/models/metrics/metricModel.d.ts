import { IMetricTrace, IRun, ITraceData } from './runModel';

export interface IMetric {
  run: IRun<IMetricTrace>;
  key: string;
  metric_name: string;
  context: { [key: string]: unknown };
  data: {
    values: number[];
    epochs: number[];
    steps: number[];
    timestamps: number[];
    xValues: number[];
    yValues: number[];
  };
  color: string;
  dasharray: string;
  x_axis_iters?: ITraceData;
  x_axis_values?: ITraceData;
  isHidden: boolean;
}
