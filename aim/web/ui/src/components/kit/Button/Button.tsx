import React from 'react';

import MUButton from '@material-ui/core/Button';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IButtonProps } from '.';

import './Button.scss';

const sizes = {
  small: '1.75rem',
  medium: '2rem',
  large: '2.25rem',
};

const fontSizes = {
  small: '0.75rem',
  medium: '0.875rem',
  large: '0.875rem',
};

const withOnlyIconSizes = {
  small: '1.5rem',
  medium: '2rem',
  large: '2.25rem',
};

function Button({
  size,
  withOnlyIcon,
  color,
  children,
  ...rest
}: IButtonProps): React.FunctionComponentElement<React.ReactNode> {
  const styleOverrides = {
    borderRadius: '0.375rem',
    padding: withOnlyIcon ? '0.25rem' : '0.5rem 1.25rem',
    fontSize: fontSizes[size || 'medium'],
    height: withOnlyIcon
      ? withOnlyIconSizes[size || 'medium']
      : sizes[size || 'medium'],
    minWidth: withOnlyIcon ? '1.5rem' : '4.375rem',
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
