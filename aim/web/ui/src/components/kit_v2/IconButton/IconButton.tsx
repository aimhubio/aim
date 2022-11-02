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
  borderRadius: '$3',
  transition: 'all 0.2s ease-in-out',
  fontSize: '$2',
  variants: {
    size: {
      xs: {
        size: '$1',
        fontSize: '$2',
      },
      sm: {
        size: '$2',
        fontSize: '$2',
      },
      md: {
        size: '$3',
        fontSize: '$2',
      },
      lg: {
        size: '$5',
        fontSize: '$3',
      },
      xl: {
        size: '$7',
        fontSize: '$3',
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
  size = 'md',
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
    >
      <Icon name={icon} />
    </Container>
  );
}

export default React.memo(IconButton);
