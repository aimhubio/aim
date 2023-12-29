import { Slot } from '@radix-ui/react-slot';

import { styled } from 'config/stitches';

const StyledSlot: any = styled(Slot, {
  variants: {
    ellipsis: {
      true: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: '100%',
      },
    },
    disabled: {
      true: {
        cursor: 'not-allowed',
        pointerEvents: 'none',
        color: '$secondary30',
      },
    },
  },
});

export default StyledSlot;
