import React from 'react';
import MUButton from '@material-ui/core/Button';
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

function Button({
  size,
  withOnlyIcon,
  color,
  children,
  ...rest
}: IButtonProps): React.FunctionComponentElement<React.ReactNode> {
  const styleOverrides = {
    borderRadius: '0.375rem',
    padding: withOnlyIcon ? '0.25rem' : '0.5 rem 1.25rem',
    fontSize: fontSizes[size || 'medium'],
    height: withOnlyIcon ? '1.5rem' : sizes[size || 'medium'],
    minWidth: withOnlyIcon ? '1.5rem' : '4.375rem',
  };

  return (
    <MUButton color={color || 'primary'} style={styleOverrides} {...rest}>
      {children}
    </MUButton>
  );
}

Button.displayName = 'Button';

export default React.memo<IButtonProps>(Button);
