import React from 'react';

import { getButtonStyles } from '../utils/getButtonStyles';

import { IButtonProps } from './Button.d';
import { ButtonSpacingMap, getIconSpacing } from './buttonConfig';
import { Container, LeftIcon, RightIcon } from './Button.style';

/**
 * @property {IButtonProps['color']} color - color of the button
 * @property {IButtonProps['size']} size - size of the button
 * @property {IButtonProps['variant']} variant - variant of the button
 * @property {IButtonProps['fullWidth']} fullWidth - whether the button should take the full width of its container
 * @property {IButtonProps['disabled']} disabled - whether the button should be disabled
 * @property {IButtonProps['leftIcon']} leftIcon - icon to be displayed on the left side of the button
 * @property {IButtonProps['rightIcon']} rightIcon - icon to be displayed on the right side of the button
 * @property {IButtonProps['children']} children - children to be displayed inside the button
 */

const Button = React.forwardRef<
  React.ElementRef<typeof Container>,
  IButtonProps
>(
  (
    {
      color = 'primary',
      size = 'md',
      variant = 'contained',
      fullWidth = false,
      horizontalSpacing = 'default',
      disabled,
      leftIcon,
      rightIcon,
      css,
      children,
      ...rest
    }: IButtonProps,
    forwardedRef,
  ) => {
    return (
      <Container
        {...rest}
        css={{
          ...getButtonStyles(color, variant, disabled),
          p: ButtonSpacingMap[horizontalSpacing][size],
          ...css,
        }}
        size={size}
        disabled={disabled}
        fullWidth={fullWidth}
        ref={forwardedRef}
      >
        {leftIcon ? (
          <LeftIcon
            css={{ ml: getIconSpacing(horizontalSpacing, size) }}
            className='startIcon'
            size='md'
            icon={leftIcon}
          />
        ) : null}
        {children}
        {rightIcon ? (
          <RightIcon
            css={{ mr: getIconSpacing(horizontalSpacing, size) }}
            className='endIcon'
            size='md'
            icon={rightIcon}
          />
        ) : null}
      </Container>
    );
  },
);

Button.displayName = 'Button';
export default React.memo(Button);
