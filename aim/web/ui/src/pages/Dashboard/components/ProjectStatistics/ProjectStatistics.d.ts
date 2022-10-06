import { IconName } from 'components/kit/Icon';

export interface IProjectStatistic {
  label: string;
  count: number;
  iconBgColor?: string;
  icon?: IconName;
  navLink?: string;
  title?: string;
}
