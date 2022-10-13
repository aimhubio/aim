import React from 'react';

import { IIconProps } from 'components/kit/Icon';

// Button component props
export interface IButtonProps
  extends Partial<React.HTMLAttributes<HTMLButtonElement>> {
  /**
   * @description The color of the button
   * @type {colorType}
   * @example 'primary'
   */
  color?: colorType;
  /**
   * @description The size of the button
   * @type {sizeType}
   * @example 'medium'
   * @default 'medium'
   */
  size?: sizeType;
  /**
   * @description The variant of the button
   * @type {variantType}
   * @example 'contained'
   * @default 'contained'
   */
  variant?: variantType;
  /**
   * @description The disabled state of the button
   * @type {boolean}
   * @example false
   * @default false
   */
  disabled?: boolean;
  /**
   * @description The start icon of the button
   * @type {IIconProps['name']}
   * @example 'add'
   */
  startIcon?: IIconProps['name'];
  /**
   * @description The end icon of the button
   * @type {IIconProps['name']}
   * @example 'add'
   */
  endIcon?: IIconProps['name'];
  /**
   * @description The full width state of the button
   * @type {boolean}
   * @example false
   */
  fullWidth?: boolean;
}

// Button component size types
type sizeType = 'small' | 'medium' | 'large' | 'xLarge';

// Button component variants
type variantType = 'text' | 'outlined' | 'contained';

// Button component color types
type colorType = 'primary' | 'secondary' | 'success' | 'error' | 'warning';
