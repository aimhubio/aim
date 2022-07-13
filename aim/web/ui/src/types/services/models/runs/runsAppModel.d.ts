import { RequestStatusEnum } from 'config/enums/requestStatusEnum';

import { IRequestProgress } from 'utils/app/setRequestProgress';

export interface IRunsAppModelState {
  selectedRows?: any;
  requestStatus: RequestStatusEnum;
  requestProgress: IRequestProgress;
  liveUpdateConfig?: {
    delay: number;
    enabled: boolean;
  };
  [key: string]: any;
}
