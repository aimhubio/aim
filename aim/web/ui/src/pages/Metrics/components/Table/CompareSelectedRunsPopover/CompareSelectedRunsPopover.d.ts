import { AppNameEnum } from 'services/models/explorer';

export interface ICompareSelectedRunsPopoverProps {
  appName: AppNameEnum;
  selectedRows: { [key: string]: any };
}
