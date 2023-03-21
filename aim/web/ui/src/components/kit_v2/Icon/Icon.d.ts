import * as React from 'react';

import { CSS } from 'config/stitches/types';

// The interface for the Icon component
export interface IIconProps
  extends Partial<React.HTMLAttributes<HTMLDivElement>> {
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
  icon: React.ReactNode;
  /**
   * @description The color of the Icon.
   * @example
   * ```tsx
   * <Icon color="red" />
   * ```
   * @default undefined
   */
  color?: CSS['color'];
}
