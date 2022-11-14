import { IconName } from 'components/kit/Icon';
import ITextProps from 'components/kit/Text/Text.d';

export interface IProjectStatistic {
  label: string;
  count: number;
  iconBgColor?: string;
  icon?: IconName;
  navLink?: string;
  badge?: { value: string; color?: ITextProps['color'] };
}
