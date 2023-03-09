import { styled } from 'config/stitches';

import Text from '../Text';

const ButtonText = styled(Text, {
  color: '$textPrimary',
  variants: {
    disabled: {
      true: {
        color: '$textPrimary50',
      },
    },
  },
});

export { ButtonText };
