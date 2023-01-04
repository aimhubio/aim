import * as Stitches from 'config/stitches/stitches.config';
import { ColorPaletteType } from 'config/stitches/stitches.config';

export interface IBadgeProps {
  /**
   * @description Badge label
   */
  label: string;
  /**
   * @description Badge color
   * @default 'primary'
   */
  color?: ColorPaletteType;
  /**
   * @description Badge size
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /**
   * @description Badge delete callback
   * @default undefined
   */
  onDelete?: (label: string) => void;
  /**
   * @description Badge disabled state
   * @default false
   * @type boolean
   */
  disabled?: boolean;
  /**
   * @description Whether Badge is monospaced
   * @default false
   * @type boolean
   */
  monospace?: boolean;
  /**
   * @description Badge stitches css prop object
   * @example { backgroundColor: 'red' }
   */
  css?: Stitches.CSS;
}
