import { styled } from 'config/stitches';

const Container: any = styled('div', {
  all: 'unset',
  display: 'inline-flex',
  width: 'fit-content',
  ai: 'center',
  jc: 'center',
  fontWeight: '$2',
  overflow: 'hidden',
  '& > button': {
    br: '0',
    bs: 'none',
    '&:not(:first-of-type)': {
      borderLeft: '1px solid',
    },
    '&:first-of-type': {
      borderTopLeftRadius: '$3',
      borderBottomLeftRadius: '$3',
    },
    '&:last-of-type': {
      borderTopRightRadius: '$3',
      borderBottomRightRadius: '$3',
    },
  },
  variants: {
    variant: {
      outlined: {
        '& > button': {
          bs: 'inset 0 0 0 1px',
          '&:not(:first-of-type)': {
            borderLeft: 'none',
            ml: '-1px',
          },
          '&:hover': {
            zIndex: 1,
          },
        },
      },
    },
  },
});

export { Container };
