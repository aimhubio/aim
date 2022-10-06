import { AppNameEnum } from 'services/models/explorer';

export interface ICompareSelectedRunsPopoverProps {
  appName: AppNameEnum;
  disabled?: boolean;
  query: string;
}
