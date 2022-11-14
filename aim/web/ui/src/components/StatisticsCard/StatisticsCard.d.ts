import { IconName } from 'components/kit/Icon';
import ITextProps from 'components/kit/Text/Text.d';

export interface IStatisticsCardProps {
  label: string;
  count: number;
  badge?: { value: string; color?: ITextProps['color'] };
  icon?: IconName;
  iconBgColor?: string;
  cardBgColor?: string;
  onMouseOver?: (id: string, source: string) => void;
  onMouseLeave?: () => void;
  navLink?: string;
  highlighted?: boolean;
  outlined?: boolean;
  isLoading?: boolean;
}
