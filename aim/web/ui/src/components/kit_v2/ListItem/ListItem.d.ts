import React from 'react';

import { CSS } from 'config/stitches/types';

/**
 * @description List item component props
 */
export interface IListItemProps
  extends Partial<React.ReactHTMLElement<HTMLDivElement>> {
  /**
   * @description The size of the list item
   * @example 'md'
   * @default 'md'
   */
  size?: ListItemSize;
  /**
   * @description The onClick event handler
   * @example () => {}
   * @type () => void
   * @default undefined
   * @optional true
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  /**
   * @description The children of the list item
   * @example <div>children</div>
   * @type React.ReactNode
   * @default undefined
   * @optional true
   */
  children?: React.ReactNode;
  /**
   * @description Is the list item disabled
   * @example true
   * @default false
   * @optional true
   * @type boolean
   */
  disabled?: boolean;
  /**
   * @description The left node of the list item
   * @example <div>left node</div>
   * @type React.ReactNode
   * @default undefined
   * @optional true
   */
  leftNode?: React.ReactNode;
  /**
   * @description The right node of the list item
   * @example <div>right node</div>
   * @type React.ReactNode
   * @default undefined
   * @optional true
   */
  rightNode?: React.ReactNode;
  /**
   * @description The css of the list item
   * @example { color: 'red' }
   * @type CSS
   */
  css?: CSS;
}

export type ListItemSize = 'sm' | 'md' | 'lg';
