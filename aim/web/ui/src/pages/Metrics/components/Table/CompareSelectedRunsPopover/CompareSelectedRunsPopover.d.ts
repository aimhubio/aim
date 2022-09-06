import { AppNameEnum } from 'services/models/explorer';

export interface ICompareSelectedRunsPopoverProps {
  appName: AppNameEnum;
  selectedRows: string[];
  keyName?: string;
  disabled?: boolean;
}
