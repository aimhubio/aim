import React from 'react';

import { CSS } from 'config/stitches/stitches.config';

import { IPopoverProps } from '../Popover/Popover';

// The interface of the Select

export interface ISelectProps {
  /**
   * @description The size of the select
   * @example 'md'
   * @default 'md'
   */
  size?: SelectSizeType;
  /**
   * @description The onChange event handler
   * @example () => {}
   * @type () => void
   * @default undefined
   */
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  /**
   * @description The options of the select
   * @example [{group: 'Metrics', options: [{value: 'metric1', label: 'Metric 1'}]}]
   * @type ISelectOption[]
   * @default undefined
   */
  options?: { group?: string; options: { value: string; label: string }[] }[];
  /**
   * @description The value of the select
   * @example 'metric1' | ['metric1', 'metric2']
   * @type string | string[]
   * @default undefined
   */
  value?: string | string[];
  /**
   * @description The css of the select
   * @example { color: 'red' }
   */
  css?: CSS;
  /**
   * @description The multiple select
   * @example false
   */
  multiple?: boolean;
  /**
   * @description The css of the list item
   * @example { color: 'red' }
   * @type CSS
   */
  css?: CSS;
  /**
   * @description The disabled state of the list item
   * @example false
   */
  disabled?: boolean;
  /**
   * @description The trigger of the list item
   * @example <Button>trigger</Button>
   */
  trigger?: React.ReactNode;
  /**
   * @description The popper props of the Select component
   * @example sideOffset: 8
   */
  popoverProps?: IPopoverProps;
  /**
   * @description onValueChange event handler
   * @example (val: string) => {}
   * @type (val: string) => void
   */
  onValueChange: (val: string) => void;
  /**
   * @description the height of the select
   * @example 400
   * @default 400
   * @type number
   */
  height?: number;
  /**
   * @description searchability of the select
   * @example false
   * @default false
   */
  searchable?: boolean;
}

type SelectSizeType = 'sm' | 'md' | 'lg';
