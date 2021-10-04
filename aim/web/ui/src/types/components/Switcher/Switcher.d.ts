import React from 'react';

export interface ISwitcherProps {
  leftLabel?: string | number | React.FunctionComponent<React.ReactNode>;
  rightLabel?: string | number | React.FunctionComponent<React.ReactNode>;
  checked: boolean;
  color?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  onChange: (checked: boolean) => void;
}
