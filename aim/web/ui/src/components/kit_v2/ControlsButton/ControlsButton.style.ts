import Icon from 'components/kit_v2/Icon';

import { styled } from 'config/stitches';

const Trigger = styled('button', {
  all: 'unset',
  display: 'inline-flex',
  width: 'fit-content',
  ai: 'center',
  jc: 'center',
  lineHeight: 1,
  fontWeight: '$2',
  cursor: 'pointer',
  borderRadius: '$3',
  transition: 'all 0.2s ease-out',
  fontSize: '$3',
  color: '$text-default-text-bold',
  variants: {
    rightIcon: { true: {} },
    leftIcon: { true: {} },
    size: {
      md: {
        minHeight: '$3',
        height: '$3',
        pl: '$5',
        pr: '$4',
      },
      lg: {
        minHeight: '$5',
        height: '$3',
        pl: '$6',
        pr: '$5',
      },
      xl: {
        minHeight: '$7',
        height: '$3',
        pl: '$7',
        pr: '$6',
      },
    },
    disabled: {
      true: {
        userSelect: 'none',
        cursor: 'not-allowed',
        pointerEvents: 'none',
        color: '$text-disable-text-subtle',
      },
    },
  },
  compoundVariants: [
    {
      rightIcon: true,
      size: 'md',
      css: {
        pr: '$3',
      },
    },
    {
      rightIcon: true,
      size: 'lg',
      css: {
        pr: '$4',
      },
    },
    {
      rightIcon: true,
      size: 'xl',
      css: {
        pr: '$6',
      },
    },
    {
      leftIcon: true,
      size: 'md',
      css: {
        pl: '$2',
      },
    },
    {
      leftIcon: true,
      size: 'lg',
      css: {
        pl: '$3',
      },
    },
    {
      leftIcon: true,
      size: 'xl',
      css: {
        pl: '$5',
      },
    },
  ],
});

const ArrowIcon: any = styled('span', {
  width: '10px',
  display: 'flex',
  ai: 'center',
  jc: 'center',
  ml: '$2',
  variants: {
    rightIcon: { true: {} },
    size: {
      md: {},
      lg: {
        ml: '$3',
      },
      xl: {
        ml: '$5',
      },
    },
  },
  compoundVariants: [
    {
      size: 'md',
      rightIcon: true,
      css: {
        mr: '$2',
      },
    },
    {
      size: 'lg',
      rightIcon: true,
      css: {
        mr: '$3',
      },
    },
    {
      size: 'xl',
      rightIcon: true,
      css: {
        mr: '$5',
      },
    },
  ],
});

const AppliedCount = styled('span', {
  width: '16px',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  height: '14px',
  lineHeight: '15px',
  display: 'inline-block',
  textAlign: 'center',
  br: '100px',
  fontSize: '10px',
  fontWeight: '$3',
  ml: '$3',
});

const LeftIcon: any = styled(Icon, {
  size: '$1',
  display: 'flex',
  ai: 'center',
  jc: 'center',
  mr: '$2',
});

const RightIcon = styled(Icon, {
  width: '$1',
});

export { Trigger, ArrowIcon, AppliedCount, LeftIcon, RightIcon };
