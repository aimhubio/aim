import { AppNameEnum } from 'services/models/explorer';

export interface ICompareSelectedRunsProps {
  appName: AppNameEnum;
  selectedRows: { [key: string]: any };
}
