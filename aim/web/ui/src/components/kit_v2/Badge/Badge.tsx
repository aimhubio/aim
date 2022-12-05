import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import Icon from 'components/kit/Icon';

import { styled } from 'config/stitches/stitches.config';

import { IBadgeProps } from './Badge.d';

const getColors: any = (color?: string, disabled?: boolean) => {
  if (color) {
    return {
      bc: `$${color}${disabled ? 50 : 70}`,
      '&:hover': {
        bc: `$${color}80`,
      },
    };
  }
  return {
    bc: 'white',
    bs: '0 0 0 1px $colors$secondary50',
    color: disabled ? '$textPrimary50' : '$textPrimary',
    '&:hover': {
      bc: '$colors$secondary10',
    },
  };
};

const BadgeContainer = styled('div', {
  width: 'fit-content',
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

const RightIcon = styled(Icon, {
  display: 'flex',
  ai: 'center',
  jc: 'center',
  size: '$1',
  ml: '$2',
  fontFamily: '$mono',
  cursor: 'pointer',
  userSelect: 'none',
  variants: {
    size: {
      xs: { mr: '$2' },
      sm: { mr: '$2' },
      md: { mr: '$4' },
      lg: { mr: '$4' },
    },
  },
});

/**
 * Badge component params
 * @param {string} label - Label of the badge
 * @param {string} size - Size of the badge
 * @param {ColorPaletteEnum} color - Color of the badge
 * @param {boolean} disabled - Disabled state of the badge
 * @param {boolean} monospace - Monospace font of the badge
 * @param {function} onDelete - Callback function for delete action
 */

const Badge = React.forwardRef<
  React.ElementRef<typeof BadgeContainer>,
  IBadgeProps
>(
  (
    {
      label,
      size = 'md',
      css,
      color,
      monospace = false,
      disabled = false,
      onDelete,
      ...rest
    }: IBadgeProps,
    forwardedRef,
  ): React.FunctionComponentElement<React.ReactNode> => {
    return (
      <ErrorBoundary>
        <BadgeContainer
          {...rest}
          size={size}
          css={{ ...css, ...getColors(color, disabled) }}
          role='button'
          font={monospace ? 'mono' : 'default'}
          rightIcon={!!onDelete}
          ref={forwardedRef}
          disabled={disabled}
        >
          {label}
          {onDelete ? (
            <RightIcon
              role='button'
              name='close'
              fontSize={10}
              size={size}
              onClick={() => onDelete(label)}
            />
          ) : null}
        </BadgeContainer>
      </ErrorBoundary>
    );
  },
);

Badge.displayName = 'Badge';

export default Badge;
