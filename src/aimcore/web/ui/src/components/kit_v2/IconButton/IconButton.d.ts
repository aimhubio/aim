import React from 'react';

import { CSS, ColorPaletteType } from 'config/stitches/types';

import { ButtonVariantType } from '../Button';
export interface IIconButtonProps
  extends Partial<React.HTMLAttributes<HTMLButtonElement>> {
  /**
   * @description The name of the icon
   * @example 'add'
   */
  icon: React.ReactNode;
  /**
   * @description The color of the icon button
   * @example 'primary'
   */
  color?: ColorPaletteType;
  /**
   * @description The size of the icon button
   * @example 'md'
   * @default 'md'
   */
  size?: sizeType;
  /**
   * @description The variant of the icon button
   * @example 'contained'
   * @default 'contained'
   */
  variant?: ButtonVariantType;
  /**
   * @description The disabled state of the icon button
   * @example false
   * @default false
   */
  disabled?: boolean;
  /**
   * @description The css prop of the icon button
   * @example { backgroundColor: 'red' }
   * @default {}
   */
  css?: CSS;
}

// IconButton component size types
type sizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// IconButton component variants
