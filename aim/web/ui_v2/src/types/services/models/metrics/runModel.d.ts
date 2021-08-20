export interface IRun {
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
  traces: {
    metric_name: string;
    context: { [key: string]: any };
    values: ITraceData;
    iters: ITraceData;
    epochs: ITraceData;
    timestamps: ITraceData;
  }[];
  runHash?: string;
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
