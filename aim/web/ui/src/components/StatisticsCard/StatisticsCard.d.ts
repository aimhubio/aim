import * as React from 'react';

import { IconName } from 'components/kit/Icon';

export interface IStatisticsCardProps {
  label: string;
  count: number;
  badge?: { value: string; style?: React.CSSProperties };
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
