import { Slot } from '@radix-ui/react-slot';

import { styled } from 'config/stitches';
import { textEllipsis } from 'config/stitches/foundations/layout';

const StyledSlot: any = styled(Slot, {
  variants: {
    ellipsis: {
      true: textEllipsis,
    },
  },
});

export { StyledSlot };
