import React from 'react';

import { CSS } from 'config/stitches/stitches.config';

// Polymorphic Box component props
export interface IBoxProps
  extends Partial<React.AllHTMLAttributes<HTMLElement>> {
  /**
   * @optional
   * @default 'div'
   * @description HTML element to render
   */
  as?: keyof HTMLElementTagNameMap;
  /**
   * @optional
   * @default {}
   * @description CSS styles
   * @example
   * <Box css={{ color: '$red', backgroundColor: '$blue' }} />
   */
  css?: CSS;
}
