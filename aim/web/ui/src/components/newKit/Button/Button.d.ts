import React from 'react';

export interface IButtonProps
  extends Partial<React.HTMLAttributes<HTMLButtonElement>> {
  color?: colorType;
  size?: sizeType;
  variant?: variantType;
  disabled?: boolean;
}

type sizeType = 'small' | 'medium' | 'large' | 'xLarge';
type variantType = 'text' | 'outlined' | 'contained';
type colorType = 'primary' | 'secondary' | 'success' | 'error' | 'warning';
