import { IconName } from 'components/kit/Icon';

export interface IProjectStatistic {
  label: string;
  trackedItemsCount: number;
  iconBgColor: string;
  icon?: IconName;
}
