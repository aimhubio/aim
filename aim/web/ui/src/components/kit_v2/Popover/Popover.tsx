import React from 'react';

import * as PopoverPrimitive from '@radix-ui/react-popover';

import Text from '../Text';
import Separator from '../Separator';

import { IPopoverProps } from './Popover.d';
import { PopoverTitleStyled, StyledContent } from './Popover.style';

/**
 * @description Popover component is for displaying a popover with a title, description, and actions
 * Popover component params
 * @param {React.ReactNode} trigger - React children
 * @param {React.ReactNode} content - React children
 * @param {boolean} defaultOpen - Default open state of the popover
 * @param {PopperProps} popperProps - Popper props
 * @param {string | React.ReactNode} title - Title of the popover
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 * @constructor
 * @example
 * <Popover
 *  trigger={<Button>Open popover</Button>}
 *  content={<Box>Popover content</Box>}
 * />
 */
function Popover({
  trigger,
  content,
  defaultOpen,
  popperProps,
  title,
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
          {title ? (
            <>
              <PopoverTitleStyled>
                {typeof title === 'string' ? (
                  <Text as='h3' color='$textPrimary80' weight='$3'>
                    {title}
                  </Text>
                ) : (
                  title
                )}
              </PopoverTitleStyled>
              <Separator css={{ height: '2px !important' }} color='$border10' />
            </>
          ) : null}
          {content}
        </StyledContent>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

Popover.displayName = 'Popover';
export default React.memo(Popover);
