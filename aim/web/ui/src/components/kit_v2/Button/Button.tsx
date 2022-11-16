import React from 'react';

import Icon from 'components/kit/Icon';

import { styled } from 'config/stitches/stitches.config';

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
        height: '$1',
        fontSize: '$2',
      },
      sm: {
        height: '$sizes$2',
        fontSize: '$2',
      },
      md: {
        height: '$3',
      },
      lg: {
        height: '$5',
      },
      xl: {
        height: '$7',
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
  variants: {
    size: {
      xs: {
        ml: 'calc($3 * -1)',
      },
      sm: {
        ml: 'calc($3 * -1)',
      },
      md: {
        ml: 'calc($4 * -1)',
      },
      lg: {
        ml: 'calc($5 * -1)',
      },
      xl: {
        ml: 'calc($7 * -1)',
        fontSize: '$3',
      },
    },
  },
});

const RightIcon = styled(IconContainer, {
  ml: '$2',
  variants: {
    size: {
      xs: {
        mr: 'calc($3 * -1)',
      },
      sm: {
        mr: 'calc($3 * -1)',
      },
      md: {
        mr: 'calc($4 * -1)',
      },
      lg: {
        mr: 'calc($5 * -1)',
      },
      xl: {
        mr: 'calc($7 * -1)',
        fontSize: '$3',
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
  size = 'md',
  variant = 'contained',
  fullWidth = false,
  horizontalSpacing = 'default',
  disabled,
  leftIcon,
  rightIcon,
  children,
  ...rest
}: IButtonProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Container
      css={{
        ...rest.style,
        ...getButtonStyles(color, variant, disabled),
        p: ButtonSpacingMap[horizontalSpacing][size],
      }}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      data-testid='button'
      {...rest}
    >
      {leftIcon ? (
        <LeftIcon
          css={{ ml: getIconSpacing(horizontalSpacing, size) }}
          size={size}
          className='startIcon'
          name={leftIcon}
        />
      ) : null}
      {children}
      {rightIcon ? (
        <RightIcon
          css={{ mr: getIconSpacing(horizontalSpacing, size) }}
          size={size}
          className='endIcon'
          name={rightIcon}
        />
      ) : null}
    </Container>
  );
}

export default React.memo(Button);
