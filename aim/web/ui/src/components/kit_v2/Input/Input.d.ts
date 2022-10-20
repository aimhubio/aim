import React from 'react';

import { IconName } from 'components/kit/Icon';

// The Input component interface.
export interface IInputProps {
  /**
   * The Input value.
   * @default ''
   */
  value: string;
  /**
   * The Input placeholder.
   * @default ''
   */
  placeholder?: string;
  /**
   * The Input size.
   * @default 'medium'
   */
  inputSize?: 'medium' | 'large' | 'xLarge';
  /**
   * The error state.
   * @default false
   */
  error?: boolean;
  /**
   * The onChange event handler.
   */
  onChange: (
    value: string,
    event?: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  /**
   * The caption string.
   */
  caption?: string;
  /**
   * The Input error message.
   */
  errorMessage?: string;
  /**
   * The input element props.
   */

  /**
   * The Input disabled state.
   * @default false
   */
  disabled?: boolean;
  /**
   * The Input left icon.
   */
  leftIcon?: IconName;

  inputElementProps?: Partial<React.HTMLProps<HTMLInputElement>>;
}
