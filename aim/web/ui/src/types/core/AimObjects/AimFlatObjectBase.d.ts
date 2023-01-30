import { Record } from '../shared';

export interface AimFlatObjectBase<T = any> {
  key: string;
  data: T;
  record?: Record;
  groups?: {
    rows?: string[];
    columns?: string[];
    [key: string]: string[];
  };
  run?: {
    // run props
    experiment: string;
    hash: string;
    // params
    [key: string]: any;
  };
  [key: string]: any;
}
