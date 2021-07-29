export interface IRun {
  name: string;
  hash: string;
  params: {
    [key: string]: IRunParam;
  };
  traces: {
    metric_name: string;
    context: { [key: string]: any };
    values: ITraceData;
    iters: ITraceData;
    epochs: ITraceData;
    timestamps: ITraceData;
  }[];
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
