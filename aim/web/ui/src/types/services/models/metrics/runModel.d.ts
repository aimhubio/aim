import { ITagProps } from 'types/pages/tags/Tags';

export interface IRun<T> {
  params: IRunParams;
  props: {
    experiment: { name: string; id: string; description: string } | null;
    name: string;
    creation_time: number;
    end_time: number;
    description: string;
    active: boolean;
    tags: ITagProps[];
  };
  created_at: number;
  traces: { metric: T[] };
  hash: string;
}

export interface ISequence<T> {
  params: IRunParams;
  props: {
    experiment: { name: string; id: string } | null;
    name: string;
    creation_time: number;
    end_time: number;
    description: string;
  };
  created_at: number;
  traces: T[];
  hash: string;
}

export interface IParamTrace {
  name: string;
  context: { [key: string]: unknown };
  last_value: { last: number | string };
}

export interface IMetricTrace {
  name: string;
  description: string;
  context: { [key: string]: unknown };
  slice: number[];
  values: ITraceData;
  iters: ITraceData;
  epochs: ITraceData;
  timestamps: ITraceData;
  x_axis_values?: ITraceData;
  x_axis_iters?: ITraceData;
}

export interface IRunParams {
  [key: string]: any;
}

export interface ITraceData {
  blob: Uint8Array;
  dtype: string;
  shape: number;
  _type: string;
}
