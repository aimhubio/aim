import React from 'react';

import MUButton from '@material-ui/core/Button';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IButtonProps } from '.';

import './Button.scss';

const sizes = {
  xxSmall: '1.25rem',
  xSmall: '1.5rem',
  small: '1.75rem',
  medium: '2rem',
  large: '2.25rem',
};

const fontSizes = {
  xxSmall: '0.625rem',
  xSmall: '0.75rem',
  small: '0.875rem',
  medium: '0.875rem',
  large: '0.875rem',
};

const withOnlyIconSizes = {
  xxSmall: '1.25rem',
  xSmall: '1.5rem',
  small: '1.75rem',
  medium: '2rem',
  large: '2.25rem',
};

const minWidthSizes = {
  xxSmall: 'auto',
  xSmall: 'auto',
  small: '4.375rem',
  medium: '4.375rem',
  large: '4.375rem',
};

const paddingSizes = {
  xxSmall: '0.125rem 0.5rem',
  xSmall: '0.25rem 0.625rem',
  small: '0.5rem 1.25rem',
  medium: '0.5rem 1.25rem',
  large: '0.5rem 1.25rem',
};

const borderRadiusSizes = {
  xxSmall: '0.25rem',
  xSmall: '0.25rem',
  small: '0.25rem',
  medium: '0.375rem',
  large: '0.5rem',
};

function Button({
  size,
  withOnlyIcon,
  color,
  children,
  ...rest
}: IButtonProps): React.FunctionComponentElement<React.ReactNode> {
  const styleOverrides = {
    borderRadius: borderRadiusSizes[size || 'medium'],
    padding: withOnlyIcon ? '0.25rem' : paddingSizes[size || 'medium'],
    fontSize: fontSizes[size || 'medium'],
    height: withOnlyIcon
      ? withOnlyIconSizes[size || 'medium']
      : sizes[size || 'medium'],
    minWidth: withOnlyIcon ? '1.75rem' : minWidthSizes[size || 'medium'],
    ...(withOnlyIcon && { width: withOnlyIconSizes[size || 'medium'] }),
  };

  return (
    <ErrorBoundary>
      <MUButton
        {...rest}
        color={color || 'primary'}
        style={{ ...styleOverrides, ...rest.style }}
      >
        {children}
      </MUButton>
    </ErrorBoundary>
  );
}

Button.displayName = 'Button';

export default React.memo<IButtonProps>(Button);
