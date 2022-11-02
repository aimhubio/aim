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
  color?: colorType;
  /**
   * @description The size of the icon button
   * @example 'medium'
   * @default 'medium'
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
}

// IconButton component size types
type sizeType = 'md' | 'lg' | 'xl';

// IconButton component variants
type variantType = 'text' | 'outlined' | 'contained';

// IconButton component color types
type colorType = 'primary' | 'secondary' | 'success' | 'error' | 'warning';
