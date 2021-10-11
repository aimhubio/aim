import { AppDataTypeEnum, AppNameEnum } from 'services/models/explorer';
import { ChartTypeEnum } from 'utils/d3';

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
