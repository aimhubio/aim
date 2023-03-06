import { ITagInfo } from 'types/pages/tags/Tags';

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
  run?: AimFlatObjectBaseRun;
  [key: string]: any;
}

export interface AimFlatObjectBaseRun {
  // run props
  name: string;
  description: string;
  experiment: string;
  tags: ITagInfo[];
  experimentId: string;
  hash: string;
  archived: boolean;
  creation_time: number;
  end_time: number;
  active: boolean;
  // run params
  dataset: Record<string, string>;
  hparams: Record<string, any>;
  v2_params: Record<string, any>;
  [key: string]: any;
}
