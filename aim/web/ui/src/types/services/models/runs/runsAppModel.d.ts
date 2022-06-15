import { IRequestProgress } from 'utils/app/setRequestProgress';

import { RequestStatusEnum } from 'config/enums/requestStatusEnum';

export interface IRunsAppModelState {
  [key: string]: any;
  selectedRows?: any;
  requestStatus: RequestStatusEnum;
  requestProgress: IRequestProgress;
}
