import * as React from 'react';

import { IconName } from 'components/kit/Icon';

export interface IProjectStatistic {
  label: string;
  count: number;
  iconBgColor?: string;
  icon?: IconName;
  navLink?: string;
  badge?: { value: string; style?: React.CSSProperties };
}
