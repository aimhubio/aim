import { styled } from 'config/stitches';

export const Container = styled('div', {
  bs: 'inset 0 0 0 1px $colors$border30',
  width: 'fit-content',
  display: 'flex',
  br: '$3',
  userSelect: 'none',
  variants: {
    size: {
      xs: {
        p: '$2',
      },
      sm: {
        p: '$3',
      },
      md: {
        p: '$3',
      },
      lg: {
        p: '$3',
      },
      xl: {
        p: '$3',
      },
    },
  },
});
