import React from 'react';

import * as PopoverPrimitive from '@radix-ui/react-popover';

import { IPopoverProps } from './Popover.d';
import { StyledContent } from './Popover.style';

function Popover({
  trigger,
  content,
  defaultOpen,
  popperProps,
}: IPopoverProps) {
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
export default React.memo(Popover);
