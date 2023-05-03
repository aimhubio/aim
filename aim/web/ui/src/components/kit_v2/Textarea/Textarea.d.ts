import React from 'react';

import { CSS } from 'config/stitches/types';

// The Textarea component interface.
export interface ITextareaProps extends React.HTMLProps<HTMLTextAreaElement> {
  /**
   * The Textarea placeholder.
   * @default ''
   */
  placeholder?: string;
  /**
   * The Textarea size.
   * @default 'md'
   */
  size?: 'md' | 'lg' | 'xl';
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
   * The Textarea error message.
   */
  errorMessage?: string;
  /**
   * The Textarea disabled state.
   * @default false
   */
  disabled?: boolean;
  /**
   * The Textarea resize state.
   * @default 'none'
   * @example 'both'
   * @example 'horizontal'
   * @example 'vertical'
   * @example 'none'
   */
  resize?: 'both' | 'horizontal' | 'vertical' | 'none';
  /**
   * The Textarea left icon.
   */
  css?: CSS;
}
