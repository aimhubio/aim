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

function Button(
  props: IButtonProps,
): React.FunctionComponentElement<React.ReactNode> {
  const styleOverrides = {
    borderRadius: '0.375rem',
    padding: `0.5rem ${props.withOnlyIcon ? '0.5rem' : '1.25rem'}`,
    fontSize: fontSizes[props.size || 'medium'],
    height: sizes[props.size || 'medium'],
    minWidth: props.withOnlyIcon ? '2.25rem' : '6.25rem',
  };

  return (
    <MUButton
      variant={props.variant}
      color={props.color || 'primary'}
      style={styleOverrides}
      onClick={props.onClick}
      size={props.size}
      disabled={props.disabled}
      className={props.className}
    >
      {props.children}
    </MUButton>
  );
}

Button.displayName = 'Button';

export default React.memo<IButtonProps>(Button);
