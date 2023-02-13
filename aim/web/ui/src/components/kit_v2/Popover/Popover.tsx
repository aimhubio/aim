import React from 'react';

import * as PopoverPrimitive from '@radix-ui/react-popover';

import { IPopoverProps } from './Popover.d';
import { StyledContent } from './Popover.style';

/**
 * @description Popover component is for displaying a popover with a title, description, and actions
 * Popover component params
 * @param {React.ReactNode} trigger - React children
 * @param {React.ReactNode} content - React children
 * @param {boolean} defaultOpen - Default open state of the popover
 * @param {PopperProps} popperProps - Popper props
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 * @constructor
 * @example
 * <Popover
 *  trigger={<Button>Open popover</Button>}
 * content={<Box>Popover content</Box>}
 * />
 */
function Popover({
  trigger,
  content,
  defaultOpen,
  popperProps,
}: IPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  const [open, setOpen] = React.useState(defaultOpen);

  const handleOpenChange = React.useCallback((val: boolean) => {
    setOpen(val);
  }, []);

  return (
    <PopoverPrimitive.Root
      onOpenChange={
        typeof trigger === 'function' ? handleOpenChange : undefined
      }
      defaultOpen={defaultOpen}
      open={open}
    >
      <PopoverPrimitive.Trigger asChild>
        {typeof trigger === 'function' ? trigger({ open }) : trigger}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <StyledContent sideOffset={5} {...popperProps}>
          {content}
        </StyledContent>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

Popover.displayName = 'Popover';
export default React.memo(Popover);
