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
  color: '$text-default-text-muted',
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
        color: '$icon-default-primary-deep !important',
      },
    },
    disabled: {
      true: {
        color: '$icon-disable-text-pastel !important',
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
      color: '$text-default-text-muted',
    },
  },
  variants: {
    disabled: {
      true: {
        cursor: 'not-allowed',
        pointerEvents: 'none',
        color: '$text-disable-text-subtle',
      },
    },
  },
});

const InputContainer: any = styled('input', {
  border: 'none',
  outline: 'none',
  height: '100%',
  width: '100%',
  color: '$text-default-text-deep',
  bs: 'inset 0px 0px 0px 1px $colors$border-default-neutral-gentle',
  br: '$3',
  fontSize: '$3',
  p: 0,
  '&::placeholder': {
    color: '$text-default-text-muted',
  },
  '&:hover': {
    bs: 'inset 0px 0px 0px 1px $colors$border-hover-neutral-soft',
  },
  '&:focus': {
    bs: 'inset 0px 0px 0px 1px $colors$border-focus-primary-soft',
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
        bs: 'inset 0px 0px 0px 1px $colors$border-default-danger-plain !important',
      },
    },
    disabled: {
      true: {
        color: '$text-disable-text-subtle',
        bs: 'inset 0px 0px 0px 1px $colors$border-disable-neutral-light',
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
      background: '$background-default-neutral-plain',
      color: '#icon-default-text-bold',
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
    disabled: {
      true: {
        '& .Icon__container': {
          '& > i': {
            opacity: 0.5,
          },
        },
        userSelect: 'none',
        cursor: 'not-allowed',
        pointerEvents: 'none',
      },
    },
  },
});

const Caption = styled('p', {
  fontSize: '$2',
  mt: '2px',
  color: '$text-default-text-muted',
  variants: {
    error: {
      true: {
        color: '$text-default-danger-plain',
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
