import React from 'react';

import Icon from 'components/kit/Icon';

import { ColorPaletteEnum, styled } from 'config/stitches/stitches.config';

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
      },
      sm: {
        size: '$2',
      },
      md: {
        size: '$3',
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

const IconButton = React.forwardRef<
  React.ElementRef<typeof Container>,
  IIconButtonProps
>(
  (
    {
      icon,
      size = 'sm',
      color = ColorPaletteEnum.primary,
      variant = 'contained',
      disabled = false,
      css,
      ...props
    }: IIconButtonProps,
    forwardedRef,
  ) => {
    return (
      <Container
        {...props}
        data-testid='icon-button'
        css={{ ...getButtonStyles(color, variant, disabled), ...css }}
        size={size}
        variant={variant}
        disabled={disabled}
        ref={forwardedRef}
      >
        <Icon name={icon} />
      </Container>
    );
  },
);

export default React.memo(IconButton);
