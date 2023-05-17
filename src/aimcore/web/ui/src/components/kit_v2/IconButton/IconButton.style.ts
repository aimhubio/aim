import { styled } from 'config/stitches';

const Container = styled('button', {
  all: 'unset',
  display: 'inline-flex',
  width: 'fit-content',
  ai: 'center',
  jc: 'center',
  fontWeight: '$2',
  cursor: 'pointer',
  borderRadius: '$3',
  transition: 'all 0.18s ease-out',
  fontSize: '$2',
  variants: {
    size: {
      xs: {
        size: '$1',
      },
      sm: {
        size: '$2',
      },
      md: {
        size: '$3',
      },
      lg: {
        size: '$5',
        fontSize: '$3',
      },
      xl: {
        size: '$7',
        fontSize: '$3',
      },
    },
    variant: {
      contained: {},
      outlined: {},
      ghost: {},
      static: {},
    },
  },
});

export { Container };
