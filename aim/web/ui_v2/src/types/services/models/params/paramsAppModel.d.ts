import { IParamTrace, IRun } from 'types/services/models/metrics/runModel';

export interface IParam {
  run: IRun<IParamTrace>;
  color: string;
  key: string;
  dasharray: string;
}
