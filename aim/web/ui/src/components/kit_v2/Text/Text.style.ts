import { Slot } from '@radix-ui/react-slot';

import { styled } from 'config/stitches';

const StyledSlot: any = styled(Slot, {
  variants: {
    truncate: {
      true: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    },
  },
});

export { StyledSlot };
