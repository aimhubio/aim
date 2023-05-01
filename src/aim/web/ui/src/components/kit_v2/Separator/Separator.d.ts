import { SeparatorProps } from '@radix-ui/react-separator';

import { CSS } from 'config/stitches/types';

export interface ISeparatorProps extends SeparatorProps {
  /**
   * @description The color of the separator
   * @example 'primary'
   * @default 'gray'
   */
  color?: CSS['color'];
  /**
   * @description The margin of the separator
   * @example '10px'
   * @default '0'
   * @type {CSS['margin']}
   */
  margin?: CSS['margin'];
  /**
   * @description The css prop of the separator
   * @example { margin: '10px' }
   * @default {}
   * @type {CSS}
   */
  css?: CSS;
}
