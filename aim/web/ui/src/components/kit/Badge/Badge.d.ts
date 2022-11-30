import React from 'react';

import { IconName } from '../Icon/Icon.d';

export interface IBadgeProps
  extends Partial<React.HTMLAttributes<HTMLDivElement>> {
  id?: string;
  label: string;
  value?: string;
  color?: string;
  startIcon?: IconName;
  size?: 'xSmall' | 'small' | 'medium' | 'large' | 'xLarge';
  onDelete?: (label: string) => void;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  maxWidth?: string;
  style?: React.CSSProperties;
  className?: string;
  selectBadge?: boolean;
  disabled?: boolean;
  monospace?: boolean;
}
