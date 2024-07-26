import Icon from 'components/kit_v2/Icon';

import { styled } from 'config/stitches';

const Container: any = styled('button', {
  all: 'unset',
  display: 'inline-flex',
  width: 'fit-content',
  minWidth: 'fit-content',
  ai: 'center',
  jc: 'center',
  lineHeight: 1,
  fontWeight: '$2',
  cursor: 'pointer',
  br: '$3',
  transition: 'all 0.2s ease-in-out',
  fontSize: '$3',
  variants: {
    size: {
      xs: {
        height: '$sizes$1',
        minHeight: '$sizes$1',
        fontSize: '$fontSizes$2',
        p: '0 $space$7',
      },
      sm: {
        height: '$sizes$2',
        minHeight: '$sizes$2',
        fontSize: '$fontSizes$2',
        p: '0 $space$7',
      },
      md: {
        height: '$sizes$3',
        minHeight: '$sizes$3',
        p: '0 $space$8',
      },
      lg: {
        height: '$sizes$5',
        minHeight: '$sizes$5',
        p: '0 $space$9',
      },
      xl: {
        height: '$sizes$7',
        minHeight: '$sizes$7',
        p: '0 $space$11',
      },
    },
    disabled: {
      true: {
        userSelect: 'none',
        cursor: 'not-allowed',
        pointerEvents: 'none',
      },
    },
    fullWidth: {
      true: {
        width: '100%',
      },
    },
  },
});

const IconContainer = styled(Icon, {
  size: '$sizes$1',
  display: 'flex',
  jc: 'center',
  ai: 'center',
  lineHeight: '1',
  fontSize: '$2',
});

const LeftIcon: any = styled(IconContainer, {
  mr: '$2',
});

const RightIcon: any = styled(IconContainer, {
  ml: '$2',
});

export { Container, LeftIcon, RightIcon };
