import { IMetricTrace, IRun, ITraceData } from './runModel';

export interface IMetric {
  run: IRun<IMetricTrace>;
  key: string;
  name: string;
  context: { [key: string]: unknown };
  data: {
    values: Float64Array;
    epochs: Float64Array;
    steps: Float64Array;
    timestamps: Float64Array;
    xValues: number[];
    yValues: number[];
  };
  color: string;
  dasharray: string;
  x_axis_iters?: ITraceData;
  x_axis_values?: ITraceData;
  isHidden: boolean;
}
