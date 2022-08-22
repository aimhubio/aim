import { Record } from '../shared';

export interface AimFlatObjectBase<T = any> {
  key: string;
  data: T;
  record?: Record;
  [key: string]: any;
  run?: {
    // run props
    experiment: string;
    hash: string;
    // params
    [key: string]: any;
  };
}
