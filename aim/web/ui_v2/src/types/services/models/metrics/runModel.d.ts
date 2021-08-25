export interface IRun<T> {
  params: {
    experiment_name: string;
    status: {
      aim: {
        version: string;
      };
      archived: 0 | 1;
      name: string;
      date: number;
      hash: string;
      message: number;
    };
    [key: string]: IRunParam;
  };
  created_at: number;
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
