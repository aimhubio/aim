import React from 'react';

import * as PopoverPrimitive from '@radix-ui/react-popover';

import { styled, keyframes } from 'config/stitches/stitches.config';

import { IPopoverProps } from './Popover.d';
const slideUpAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const slideRightAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateX(-2px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
});

const slideDownAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(-2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const slideLeftAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateX(2px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
});

const StyledContent = styled(PopoverPrimitive.Content, {
  borderRadius: 4,
  padding: 20,
  width: 260,
  zIndex: '$popover',
  backgroundColor: 'white',
  boxShadow:
    'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  '@media (prefers-reduced-motion: no-preference)': {
    animationDuration: '400ms',
    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    willChange: 'transform, opacity',
    '&[data-state="open"]': {
      '&[data-side="top"]': { animationName: slideDownAndFade },
      '&[data-side="right"]': { animationName: slideLeftAndFade },
      '&[data-side="bottom"]': { animationName: slideUpAndFade },
      '&[data-side="left"]': { animationName: slideRightAndFade },
    },
  },
  '&:focus': {
    boxShadow:
      "hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px, 0 0 0 2px 'black'",
  },
});

// Primitives
const PopoverContainer = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

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
    <PopoverContainer
      onOpenChange={
        typeof trigger === 'function' ? handleOpenChange : undefined
      }
      defaultOpen={defaultOpen}
      open={open}
    >
      <PopoverTrigger asChild>
        {typeof trigger === 'function' ? trigger({ open }) : trigger}
      </PopoverTrigger>
      <PopoverPrimitive.Portal>
        <StyledContent sideOffset={5} {...popperProps}>
          {content}
        </StyledContent>
      </PopoverPrimitive.Portal>
    </PopoverContainer>
  );
}
export default React.memo(Popover);
