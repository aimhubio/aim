import { NavLinkProps } from 'react-router-dom';

import { CSS } from 'config/stitches/types';

export interface ILinkProps extends NavLinkProps {
  /**
   * @description The font size of the link
   * @default '$3'
   * @type CSS['fontSize']
   */
  fontSize?: CSS['fontSize'];
  /**
   * @description The font weight of the link
   * @default '$2'
   * @type CSS['fontWeight']
   */
  fontWeight?: CSS['fontWeight'];
  /**
   * @description The color of the link
   * @default '$primary'
   * @type CSS['color']
   */
  color?: CSS['color'];
  /**
   * @description The css object to override the default styles
   * @default {}
   * @type CSS
   * @example
   * {
   *  textDecoration: 'underline',
   * '&:hover': {
   *   textDecoration: 'none',
   * },
   * }
   */
  css?: CSS;
  /**
   * @description The underline of the link
   * @default true
   * @type boolean
   */
  underline?: boolean;
  /**
   * @description Ellipsis the text of the link
   * @default false
   * @type boolean
   * @example
   * <Link ellipsis>Some long text</Link>
   */
  ellipsis?: boolean;
  /**
   * @description The children of the link
   * @default null
   * @type React.ReactNode
   */
  children: React.ReactNode;
}
