import { AppNameEnum } from 'types/global.d';

export interface ICompareSelectedRunsPopoverProps {
  appName: AppNameEnum;
  disabled?: boolean;
  query: string;
  buttonText?: string;
}
