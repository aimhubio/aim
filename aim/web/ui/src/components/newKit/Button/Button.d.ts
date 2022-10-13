import React from 'react';

import { IIconProps } from 'components/kit/Icon';

export interface IButtonProps
  extends Partial<React.HTMLAttributes<HTMLButtonElement>> {
  color?: colorType;
  size?: sizeType;
  variant?: variantType;
  disabled?: boolean;
  startIcon?: IIconProps['name'];
  endIcon?: IIconProps['name'];
  fullWidth?: boolean;
}

type sizeType = 'small' | 'medium' | 'large' | 'xLarge';
type variantType = 'text' | 'outlined' | 'contained';
type colorType = 'primary' | 'secondary' | 'success' | 'error' | 'warning';
