import React from 'react';
import { IButtonProps } from 'types/components/Button/Button';
import MUButton from '@material-ui/core/Button';

import './Button.scss';

const sizes = {
  small: '28px',
  medium: '32px',
  large: '36px',
};

const fontSizes = {
  small: '12px',
  medium: '14px',
  large: '14px',
};

function Button(
  props: IButtonProps,
): React.FunctionComponentElement<React.ReactNode> {
  const styleOverrides = {
    borderRadius: '6px',
    padding: `9px ${props.withOnlyIcon ? '9px' : '20px'}`,
    marginBottom: '5px',
    fontSize: fontSizes[props.size || 'medium'],
    height: sizes[props.size || 'medium'],
    minWidth: props.withOnlyIcon ? '36px' : '100px',
  };

  return (
    <MUButton
      variant={props.variant}
      color='primary'
      style={styleOverrides}
      onClick={props.onClick}
      size={props.size}
      disabled={props.disabled}
    >
      {props.children}
    </MUButton>
  );
}

Button.displayName = 'Button';

export default React.memo<IButtonProps>(Button);
