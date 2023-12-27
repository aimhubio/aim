import React from 'react';

import { PopperContentProps } from '@radix-ui/react-popover';

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

export interface PopperProps extends PopperContentProps {
  /**
   * styles for popper
   * @default: {}
   * */
  css?: CSS;
}
