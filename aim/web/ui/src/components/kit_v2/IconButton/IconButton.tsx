import React from 'react';

import Icon from 'components/kit_v2/Icon';

import { getButtonStyles } from '../utils/getButtonStyles';

import { IIconButtonProps } from './IconButton.d';
import { Container } from './IconButton.style';

/**
 * @description IconButton component
 * IconButton component params
 * @param {string} icon - Icon of the button
 * @param {string} size - Size of the button
 * @param {string} color - Color of the button
 * @param {string} variant - Variant of the button
 * @param {boolean} disabled - Disabled state of the button
 * @returns {React.FunctionComponentElement<React.ReactNode>} - React component
 * @example
 * <IconButton icon={IconName} size="sm" color="primary" variant="contained" />
 */
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
  ): React.FunctionComponentElement<React.ReactNode> => {
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
        <Icon className='Icon' size={size === 'xl' ? 'lg' : 'md'} icon={icon} />
      </Container>
    );
  },
);

export default React.memo(IconButton);
