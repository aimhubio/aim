import * as PopoverPrimitive from '@radix-ui/react-popover';

import { keyframes, styled } from 'config/stitches';

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
  br: '5px',
  padding: '$7',
  width: 340,
  zIndex: '$popover',
  backgroundColor: 'white',
  border: '1px solid rgba(90, 102, 122, 0.2)',
  boxShadow: '0 2px 4px -4px rgba(54, 61, 73, 0.25)',
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

const PopoverTitleStyled = styled('div', {
  background: '#F7F7F8',
  borderRadius: '5px 5px 0 0',
  p: '$5 $7',
  borderBottom: '1px solid $border20',
});

export { StyledContent, PopoverTitleStyled };
