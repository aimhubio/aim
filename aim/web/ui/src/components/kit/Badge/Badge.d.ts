import React from 'react';

import { IconName } from '../Icon/Icon.d';

export interface IBadgeProps {
  id?: string;
  label: string;
  color?: string;
  startIcon?: IconName;
  size?: 'xSmall' | 'small' | 'medium' | 'large' | 'xLarge';
  onDelete?: (label: string) => void;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  maxWidth?: string;
  style?: React.CSSProperties;
  className?: string;
  selectBadge?: boolean;
}
