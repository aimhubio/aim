import { IconName } from 'components/kit/Icon';

export interface IStatisticsCardProps {
  label: string;
  count: number;
  icon?: IconName;
  iconBgColor?: string;
  cardBgColor?: string;
}
