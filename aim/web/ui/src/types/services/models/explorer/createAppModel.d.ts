import { AppDataTypeEnum, AppNameEnum } from 'services/models/explorer';
import { ChartTypeEnum } from 'utils/d3';
import { IMetricAppModelState } from '../metrics/metricsAppModel';
import { IParamsAppModelState } from '../params/paramsAppModel';
import { IRunsAppModelState } from '../runs/runsAppModel';

export interface IAppInitialConfig {
  dataType: AppDataTypeEnum;
  selectForm: AppNameEnum;
  grouping: boolean;
  appName: AppNameEnum;
  components: {
    table?: boolean;
    charts?: ChartTypeEnum[];
  };
}

export type IAppModelState =
  | IMetricAppModelState
  | IParamsAppModelState
  | IRunsAppModelState;
