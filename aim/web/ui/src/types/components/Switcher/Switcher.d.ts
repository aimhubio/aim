import React, { ReactElement } from 'react';

export interface ISwitcherProps {
  leftLabel?: SwitcherLabel;
  rightLabel?: SwitcherLabel;
  checked: boolean | undefined;
  color?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  variant?: 'contained' | 'outlined';
  name?: string;
  onChange: (e: React.ChangeEvent, checked: boolean) => void;
}

export type SwitcherLabel =
  | string
  | number
  | React.FunctionComponent<React.ReactElement>
  | ReactElement;
