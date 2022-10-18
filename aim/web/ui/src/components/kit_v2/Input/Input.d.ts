import React from 'react';

// The Input component interface.
export interface IInputProps
  extends Partial<React.HTMLProps<HTMLInputElement>> {
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
   * The Input message.
   * @default ''
   */
  message?: string;
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
}
