import React from 'react';
import { IButtonProps } from 'types/components/Button/Button';
import MUButton from '@material-ui/core/Button';

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
    padding: `0.5rem ${withOnlyIcon ? '0.5rem' : '1.25rem'}`,
    fontSize: fontSizes[size || 'medium'],
    height: sizes[size || 'medium'],
    minWidth: withOnlyIcon ? '2.25rem' : '6.25rem',
  };

  return (
    <MUButton color={color || 'primary'} style={styleOverrides} {...rest}>
      {children}
    </MUButton>
  );
}

Button.displayName = 'Button';

export default React.memo<IButtonProps>(Button);
