import React from 'react';

import { IconName } from 'components/kit/Icon';

// Button component props
export interface IButtonProps
  extends Partial<React.HTMLAttributes<HTMLButtonElement>> {
  /**
   * @description The color of the button
   * @example 'primary'
   */
  color?: ButtonColorType;
  /**
   * @description The size of the button
   * @example 'medium'
   * @default 'medium'
   */
  size?: ButtonSizeType;
  /**
   * @description The variant of the button
   * @example 'contained'
   * @default 'contained'
   */
  variant?: ButtonVariantType;
  /**
   * @description The disabled state of the button
   * @example false
   * @default false
   */
  disabled?: boolean;
  /**
   * @description The start icon of the button

   * @example 'add'
   */
  startIcon?: IconName;
  /**
   * @description The end icon of the button
   * @example 'add'
   */
  endIcon?: IconName;
  /**
   * @description The full width state of the button
   * @example false
   */
  fullWidth?: boolean;
}

// Button component size types
export type ButtonSizeType = 'sm' | 'md' | 'lg' | 'xl';

// Button component variants
type ButtonVariantType = 'text' | 'outlined' | 'contained';

// Button component color types
type ButtonColorType =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning';
