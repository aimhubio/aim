import { styled } from 'config/stitches/stitches.config';

const ButtonText = styled('span', {
  color: '$textPrimary',
  variants: {
    color: {
      primary: {
        color: '$textPrimary80',
      },
      secondary: {
        color: '$textPrimary',
      },
    },
    disabled: {
      true: {
        color: '$textPrimary50',
      },
    },
  },
});

export { ButtonText };
