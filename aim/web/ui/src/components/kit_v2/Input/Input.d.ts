import React from 'react';

import { CSS } from '@stitches/react';

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
   * @default 'md'
   */
  inputSize?: 'md' | 'lg' | 'xl';
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
  leftIcon?: React.ReactNode;
  /**
   * Input element props
   * @default {}
   * @example { type: 'password' }
   */
  inputElementProps?: Partial<React.HTMLProps<HTMLInputElement>>;
  /**
   * The Input css prop.
   * @default {}
   * @example { backgroundColor: 'red' }
   */
  css?: CSS;
}
