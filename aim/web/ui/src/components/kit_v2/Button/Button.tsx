import React from 'react';

import { Icon } from 'components/kit';

import { ColorPaletteEnum, styled } from 'config/stitches/stitches.config';

import { getButtonStyles } from '../utils/getButtonStyles';

import { IButtonProps } from './Button.d';
import { ButtonSpacingMap, getIconSpacing } from './buttonConfig';

const Container = styled('button', {
  all: 'unset',
  display: 'inline-flex',
  width: 'fit-content',
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
        fontSize: '$fontSizes$2',
        p: '0 $space$7',
      },
      sm: {
        height: '$sizes$2',
        fontSize: '$fontSizes$2',
        p: '0 $space$7',
      },
      md: {
        height: '$sizes$3',
        p: '0 $space$8',
      },
      lg: {
        height: '$sizes$5',
        p: '0 $space$9',
      },
      xl: {
        height: '$sizes$7',
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

const LeftIcon = styled(IconContainer, {
  mr: '$2',
});

const RightIcon = styled(IconContainer, {
  ml: '$2',
});

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
      color = ColorPaletteEnum.primary,
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
            name={leftIcon}
          />
        ) : null}
        {children}
        {rightIcon ? (
          <RightIcon
            css={{ mr: getIconSpacing(horizontalSpacing, size) }}
            className='endIcon'
            name={rightIcon}
          />
        ) : null}
      </Container>
    );
  },
);
export default React.memo(Button);
