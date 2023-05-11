import { Slot } from '@radix-ui/react-slot';

import { styled } from 'config/stitches';
import { textEllipsis } from 'config/stitches/foundations/layout';

const StyledSlot: any = styled(Slot, {
  variants: {
    ellipsis: {
      true: textEllipsis,
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

export { StyledSlot };
