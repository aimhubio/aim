import React from 'react';

import { CSS } from 'config/stitches/types';

// The Input component interface.
export interface IInputProps extends React.HTMLProps<HTMLInputElement> {
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
   * The caption string.
   */
  caption?: string;
  /**
   * The Input error message.
   */
  errorMessage?: string;
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
   * The Input css prop.
   * @default {}
   * @example { backgroundColor: 'red' }
   */
  css?: CSS;
}
