export interface IRun<T> {
  params: IRunParams;
  props: {
    experiment: string | null;
    name: string;
  };
  created_at: number;
  hash: string;
  traces: T[];
  hash: string;
}

export interface IParamTrace {
  metric_name: string;
  context: { [key: string]: unknown };
  last_value: { last: number | string };
}

export interface IMetricTrace {
  metric_name: string;
  context: { [key: string]: unknown };
  values: ITraceData;
  iters: ITraceData;
  epochs: ITraceData;
  timestamps: ITraceData;
}

export interface IRunParam {
  [key: string]: any;
}

export interface ITraceData {
  blob: ArrayBuffer;
  dtype: string;
  shape: number;
  _type: string;
}
