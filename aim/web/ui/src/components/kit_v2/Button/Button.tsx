import React from 'react';

import { Icon } from 'components/kit';

import { styled } from 'config/stitches/stitches.config';

import { getButtonStyles } from '../utils/getButtonStyles';

import { IButtonProps } from './Button.d';

const Container = styled('button', {
  all: 'unset',
  display: 'inline-flex',
  width: 'fit-content',
  ai: 'center',
  jc: 'center',
  fontWeight: '$2',
  cursor: 'pointer',
  br: '$3',
  transition: 'all 0.2s ease-in-out',
  fontSize: '$3',
  variants: {
    size: {
      xs: {},
      sm: {
        height: '$sizes$1',
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
});

const LeftIcon = styled(IconContainer, {
  mr: '$space$2',
  variants: {
    size: {
      xs: {
        ml: '$space$3',
      },
      sm: {
        ml: '$space$3',
      },
      md: {
        ml: '$space$4',
      },
      lg: {
        ml: '$space$5',
      },
      xl: {
        ml: '$space$7',
      },
    },
  },
});

const RightIcon = styled(IconContainer, {
  ml: '$space$2',
  variants: {
    size: {
      xs: {
        mr: '$space$3',
      },
      sm: {
        mr: '$space$3',
      },
      md: {
        mr: '$space$4',
      },
      lg: {
        mr: '$space$5',
      },
      xl: {
        mr: '$space$7',
      },
    },
  },
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
function Button({
  color = 'primary',
  size = 'sm',
  variant = 'contained',
  fullWidth = false,
  disabled,
  leftIcon,
  rightIcon,
  children,
  ...rest
}: IButtonProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Container
      css={{ ...rest.style, ...getButtonStyles(color, variant, disabled) }}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      {...rest}
    >
      {leftIcon ? (
        <LeftIcon size={size} className='startIcon' name={leftIcon} />
      ) : null}
      {children}
      {rightIcon ? (
        <RightIcon size={size} className='endIcon' name={rightIcon} />
      ) : null}
    </Container>
  );
}

export default React.memo(Button);
