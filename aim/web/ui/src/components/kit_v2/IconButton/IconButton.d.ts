import * as Stitches from '@stitches/react';

import { ColorPaletteEnum } from 'config/stitches/stitches.config';

import { IconName } from '../../kit/Icon';
export interface IIconButtonProps
  extends Partial<React.HTMLAttributes<HTMLButtonElement>> {
  /**
   * @description The name of the icon
   * @example 'add'
   */
  icon: IconName;
  /**
   * @description The color of the icon button
   * @example 'primary'
   */
  color?: ColorPaletteEnum;
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
  variant?: variantType;
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
  css?: Stitches.CSS;
}

// IconButton component size types
type sizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// IconButton component variants
type variantType = 'text' | 'outlined' | 'contained';
