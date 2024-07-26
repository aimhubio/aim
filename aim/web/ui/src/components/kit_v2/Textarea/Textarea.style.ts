import { styled } from 'config/stitches';

const Container = styled('div', {
  display: 'flex',
  fd: 'column',
});

const TextareaWrapper = styled('div', {
  position: 'relative',
  display: 'flex',
  ai: 'center',
  variants: {
    disabled: {
      true: {
        cursor: 'not-allowed',
        pointerEvents: 'none',
        color: '$secondary30',
      },
    },
  },
});

const TextareaContainer: any = styled('textarea', {
  border: 'none',
  outline: 'none',
  height: '100%',
  width: '100%',
  color: '$textPrimary',
  fontFamily: 'Inter',
  bs: 'inset 0px 0px 0px 1px $colors$secondary50',
  br: '$3',
  fontSize: '$3',
  p: '$5',
  '&::placeholder': {
    color: '$textPrimary50',
  },
  '&:hover': {
    bs: 'inset 0px 0px 0px 1px $colors$secondary100',
  },
  '&:focus': {
    bs: 'inset 0px 0px 0px 1px $colors$primary100',
  },
  variants: {
    size: {
      md: {
        minHeight: '$sizes$7',
        p: '$5',
      },
      lg: {
        p: '$7',
        minHeight: '$sizes$11',
      },
      xl: {
        p: '$8',
        minHeight: '$sizes$12',
      },
    },
    error: {
      true: {
        bs: 'inset 0px 0px 0px 1px $colors$danger100 !important',
      },
    },
    disabled: {
      true: {
        bs: 'inset 0px 0px 0px 1px $colors$secondary30 !important',
        color: '$textPrimary50',
      },
    },
  },
});

const Caption = styled('p', {
  fontSize: '$2',
  mt: '2px',
  color: '$textPrimary50',
  variants: {
    error: {
      true: {
        color: '$danger100',
      },
    },
    disabled: {
      true: {
        color: '$secondary30',
      },
    },
  },
});

export { Container, TextareaContainer, TextareaWrapper, Caption };
