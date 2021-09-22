import React from 'react';
import { IconName } from '../Icon/Icon';

export interface ITagLabelProps {
  id?: string;
  label: string;
  color: string;
  iconName?: IconName;
  variant?: 'default' | 'outlined';
  size?: 'small' | 'medium';
  onDelete?: (label: string) => void;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}
