import React from 'react';

import Icon from 'components/kit/Icon';

import { styled } from 'config/stitches/stitches.config';

import { getButtonStyles } from '../utils/getButtonStyles';

import { IIconButtonProps } from './IconButton.d';

const Container = styled('button', {
  all: 'unset',
  display: 'inline-flex',
  width: 'fit-content',
  ai: 'center',
  jc: 'center',
  fontWeight: '$2',
  cursor: 'pointer',
  borderRadius: '$1',
  transition: 'all 0.2s ease-in-out',
  fontSize: '$2',
  variants: {
    size: {
      small: {
        height: '$sizes$1',
        fontSize: '$fontSizes$2',
      },
      medium: {
        height: '$sizes$3',
      },
      large: {
        height: '$sizes$5',
      },
      xLarge: {
        height: '$sizes$7',
      },
    },
    disabled: {
      true: {
        userSelect: 'none',
        cursor: 'not-allowed',
        pointerEvents: 'none',
      },
    },
    variant: {
      contained: {},
      outlined: {},
      text: {},
    },
  },
});

function IconButton({
  icon,
  size = 'medium',
  color = 'primary',
  variant = 'contained',
  disabled = false,
  ...props
}: IIconButtonProps) {
  return (
    <Container
      {...props}
      data-testid='icon-button'
      css={{ ...getButtonStyles(color, variant, disabled) }}
      size={size}
      variant={variant}
      disabled={disabled}
    >
      <Icon name={icon} />
    </Container>
  );
}

export default React.memo(IconButton);
