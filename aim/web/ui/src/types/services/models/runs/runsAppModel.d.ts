import { RequestStatusEnum } from 'config/enums/requestStatusEnum';

import { IRequestProgress } from 'utils/app/setRequestProgress';

export interface IRunsAppModelState {
  [key: string]: any;
  selectedRows?: any;
  requestStatus: RequestStatusEnum;
  requestProgress: IRequestProgress;
}
