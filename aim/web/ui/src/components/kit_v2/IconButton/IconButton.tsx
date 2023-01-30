import React from 'react';

import Icon from 'components/kit/Icon';

import { getButtonStyles } from '../utils/getButtonStyles';

import { IIconButtonProps } from './IconButton.d';
import { Container } from './IconButton.style';

const IconButton = React.forwardRef<
  React.ElementRef<typeof Container>,
  IIconButtonProps
>(
  (
    {
      icon,
      size = 'sm',
      color = 'primary',
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
