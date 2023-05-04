import Icon from 'components/kit_v2/Icon';

import { styled } from 'config/stitches';
import { CSS } from 'config/stitches/types';

function getColors({
  color,
  disabled,
  actionable = false,
}: {
  color: string | undefined;
  disabled: boolean;
  actionable?: boolean;
}): CSS {
  if (color) {
    return {
      bc: `$${color}${disabled ? 50 : 70}`,
      '&:hover': actionable
        ? {
            bc: `$${color}80`,
          }
        : {},
    };
  }
  return {
    bc: 'white',
    bs: 'inset 0 0 0 1px $colors$secondary50',
    color: disabled ? '$textPrimary50' : '$textPrimary',
    '&:hover': actionable
      ? {
          bc: '$colors$secondary10',
        }
      : {},
  };
}

const BadgeContainer = styled('div', {
  minWidth: 'fit-content',
  display: 'inline-flex',
  ai: 'center',
  br: '$3',
  color: '$textPrimary',
  fontWeight: '$2',
  lineHeight: '1',
  transition: 'all 0.2s ease-out',
  variants: {
    font: {
      mono: {
        fontMono: 14,
      },
      default: {
        fontSize: '$3',
      },
    },
    rightIcon: { true: {} },
    size: {
      xs: {
        height: '$1',
        p: '0 $4',
      },
      sm: {
        height: '$2',
        p: '0 $4',
      },
      md: {
        height: '$3',
        p: '0 $6',
      },
      lg: {
        height: '$5',
        p: '0 $6',
      },
    },
    disabled: {
      true: {
        userSelect: 'none',
        cursor: 'not-allowed',
        pointerEvents: 'none',
        color: '$textPrimary50',
      },
    },
  },
  compoundVariants: [
    {
      rightIcon: true,
      css: {
        pr: '0',
      },
    },
  ],
});

const RightIcon: any = styled(Icon, {
  display: 'flex',
  ai: 'center',
  jc: 'center',
  size: '$1',
  ml: '$2',
  fontFamily: '$mono',
  cursor: 'pointer',
  userSelect: 'none',
  variants: {
    inputSize: {
      xs: { mr: '$2' },
      sm: { mr: '$2' },
      md: { mr: '$4' },
      lg: { mr: '$4' },
    },
  },
});

export { BadgeContainer, RightIcon, getColors };
