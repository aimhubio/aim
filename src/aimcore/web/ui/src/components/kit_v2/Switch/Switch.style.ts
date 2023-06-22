import * as SwitchPrimitive from '@radix-ui/react-switch';

import { styled } from 'config/stitches';

const ThumbStyled = styled(SwitchPrimitive.Thumb, {
  display: 'block',
  backgroundColor: 'white',
  br: '20px',
  bs: '0px 2px 4px rgba(28, 40, 82, 0.15)',
  transition: 'all 0.2s ease-out',
  transform: 'translateX(2px)',
  willChange: 'transform',
  variants: {
    size: {
      sm: {
        height: 8,
        width: 8,
        '&[data-state="checked"]': {
          transform: 'translateX(100%) translateX(6px)',
        },
      },
      md: {
        height: 12,
        width: 12,
        '&[data-state="checked"]': {
          transform: 'translateX(100%) translateX(6px)',
        },
      },
      lg: {
        height: 16,
        width: 16,
        '&[data-state="checked"]': {
          transform: 'translateX(100%) translateX(4px)',
        },
      },
    },
  },
});

const SwitchStyled = styled(SwitchPrimitive.Root, {
  all: 'unset',
  cursor: 'pointer',
  bc: '$background-default-neutral-gentle',
  br: '$pill',
  position: 'relative',
  '&[data-disabled]': {
    pointerEvents: 'none',
  },
  '&[data-state="checked"]': {
    bc: '$background-default-primary-plain',
    '&[data-disabled]': { bc: '$background-disable-primary-soft' },
    '&:active': {
      bc: '$background-hover-primary-bold',
    },
  },
  '&[data-state="unchecked"]': {
    '&[data-disabled]': { bc: '$background-disable-neutral-light' },
  },
  variants: {
    size: {
      sm: {
        height: 12,
        minHeight: 12,
        width: '$3',
        '&:active': {
          [`& ${ThumbStyled}`]: { width: 10 },
          '&[data-state="checked"]': {
            [`& ${ThumbStyled}`]: {
              transform: 'translateX(100%) translateX(2px)',
            },
          },
        },
      },
      md: {
        height: 16,
        minHeight: 16,
        width: '$7',
        '&:active': {
          [`& ${ThumbStyled}`]: { width: 14 },
          '&[data-state="checked"]': {
            [`& ${ThumbStyled}`]: {
              transform: 'translateX(100%) translateX(2px)',
            },
          },
        },
      },
      lg: {
        height: '$1',
        minHeight: '$1',
        width: '$10',
        '&:active': {
          [`& ${ThumbStyled}`]: { width: 18 },
          '&[data-state="checked"]': {
            [`& ${ThumbStyled}`]: {
              transform: 'translateX(100%) translateX(0px)',
            },
          },
        },
      },
    },
  },
});

export { SwitchStyled, ThumbStyled };
