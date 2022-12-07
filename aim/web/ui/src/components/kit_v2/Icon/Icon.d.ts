import * as React from 'react';

import { CSS } from 'config/stitches/stitches.config';

// The interface for the Icon component
export interface IIconProps {
  /**
   * @description The css property is used to extend the styles of the component.
   * @example
   * ```tsx
   * <Icon css={{ color: '$red' }} />
   * ```
   * @see https://stitches.dev/docs/api#css
   * @default undefined
   */
  css?: CSS;
  /**
   * @description The size of the Icon.
   * @example
   * ```tsx
   * <Icon size="lg" />
   * ```
   * @default lg
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * @description The icon node.
   * @example
   * ```tsx
   * <Icon icon={<IconDeviceTablet/>} />
   * ```
   * ```tsx
   * <Icon icon={IconDeviceTablet} />
   * ```
   * @default undefined
   * @see https://tablericons.com/
   */
  icon: React.ReactNode | React.Element;
}
