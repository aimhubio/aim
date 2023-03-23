import Icon from 'components/kit_v2/Icon';

import { styled } from 'config/stitches';

const Container = styled('div', {
  display: 'flex',
  fd: 'column',
});

const LeftIcon = styled(Icon, {
  position: 'absolute',
  display: 'flex',
  ai: 'center',
  jc: 'center',
  size: '$sizes$1',
  color: '$secondary50',
  pointerEvents: 'none',
  variants: {
    inputSize: {
      md: {
        left: '$space$4',
      },
      lg: {
        left: '$space$5',
      },
      xl: {
        left: '$space$6',
      },
    },
    focused: {
      true: {
        color: '$textPrimary !important',
      },
    },
    disabled: {
      true: {
        color: '$secondary30',
      },
    },
  },
});

const InputWrapper = styled('div', {
  position: 'relative',
  display: 'flex',
  ai: 'center',
  '&:hover': {
    [`& ${LeftIcon}`]: {
      color: '$secondary100',
    },
  },
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

const InputContainer: any = styled('input', {
  border: 'none',
  outline: 'none',
  height: '100%',
  width: '100%',
  color: '$textPrimary',
  bs: '0px 0px 0px 1px $colors$secondary50',
  br: '$3',
  fontSize: '$3',
  p: 0,
  '&::placeholder': {
    color: '$textPrimary50',
  },
  '&:hover': {
    bs: '0px 0px 0px 1px $colors$secondary100',
  },
  '&:focus': {
    bs: '0px 0px 0px 1px $colors$primary100',
  },
  variants: {
    leftIcon: { true: {} },
    size: {
      md: {
        height: '$sizes$3',
        pl: '$6',
        pr: '$16',
      },
      lg: {
        pl: '$7',
        pr: '$17',
        height: '$sizes$5',
      },
      xl: {
        pl: '$8',
        pr: '$18',
        height: '$sizes$7',
      },
    },
    error: {
      true: {
        bs: '0px 0px 0px 1px $colors$danger100 !important',
      },
    },
    disabled: {
      true: {
        color: '$textPrimary50',
      },
    },
  },
  compoundVariants: [
    {
      leftIcon: true,
      size: 'md',
      css: {
        pl: '$16',
      },
    },
    {
      leftIcon: true,
      size: 'lg',
      css: {
        pl: '$17',
      },
    },
    {
      leftIcon: true,
      size: 'xl',
      css: {
        pl: '$18',
      },
    },
  ],
});

const ClearButtonContainer = styled('div', {
  position: 'absolute',
  display: 'flex',
  ai: 'center',
  jc: 'center',
  size: '$sizes$1',
  cursor: 'pointer',
  '& .Icon__container': {
    display: 'flex',
    ai: 'center',
    jc: 'center',
    p: '3px',
    '& > i': {
      background: '$secondary20',
      color: '#5A667A',
      br: '$round',
      height: '100%',
      p: '1px',
    },
  },
  variants: {
    size: {
      md: {
        right: '$4',
      },
      lg: {
        right: '$5',
      },
      xl: {
        right: '$6',
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

export {
  Container,
  InputContainer,
  InputWrapper,
  LeftIcon,
  ClearButtonContainer,
  Caption,
};
