import { IRun } from 'types/services/models/metrics/runModel';

export interface IParam {
  run: IRun;
  color: string;
  key: string;
  dasharray: string;
}

export interface ITrace {
  metric_name: string;
  context: { subset: string };
  last_value: { last: number | string };
}
