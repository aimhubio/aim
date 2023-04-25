import React from 'react';

import { PopperContentProps } from '@radix-ui/react-popover';
import type { SIDE_OPTIONS, ALIGN_OPTIONS } from '@radix-ui/react-popper';

import { CSS } from 'config/stitches/types';

// Interface of the Popover component
export interface IPopoverProps {
  /**
   * Popover content
   */
  content: React.ReactNode | any;
  /**
    * Trigger element
    @default: <Button>Click me</Button>
    */
  trigger: React.ReactNode | (({ open: boolean }) => React.ReactNode);
  /**
   * popper props
   */
  popperProps?: PopperProps;
  /**
    * Popover is default open
    @default: false
    */
  defaultOpen?: boolean;
  /**
   * title for popover
   * @default: undefined
   * @optional
   */
  title?: string | React.ReactNode;
}

export interface PopperProps extends Partial<PopperContentProps> {
  /**
   * styles for popper
   * @default: {}
   * */
  css?: CSS;
  /**
   * popper side SIDE_OPTIONS = ["top", "right", "bottom", "left"]
   * */
  side?: typeof SIDE_OPTIONS[number];
  /**
   * popper align ALIGN_OPTIONS = ["start", "center", "end"]
   * */
  align?: typeof ALIGN_OPTIONS[number];
}
