import { Slot } from '@radix-ui/react-slot';

import { styled } from 'config/stitches';

const Container: any = styled('div', {
  display: 'inline-flex',
  ai: 'center',
  jc: 'center',
  size: '$1',
});

const IconWrapper = styled('i', {
  display: 'inline-flex',
  ai: 'center',
  jc: 'center',
  variants: {
    size: {
      sm: {
        size: '12px',
      },
      md: {
        size: '16px',
      },
      lg: {
        size: '$1',
      },
    },
  },
});

const IconSlot = styled(Slot, {
  width: '100%',
  height: '100%',
});

export { Container, IconWrapper, IconSlot };
