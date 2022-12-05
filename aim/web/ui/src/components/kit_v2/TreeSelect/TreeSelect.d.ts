import { TreeSelectProps } from 'antd';

// The interface of the TreeSelect component
export interface ITreeSelectProps extends Partial<TreeSelectProps> {
  /**
   * @description The size of the TreeSelect
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * @description The disabled state of the TreeSelect
   * @example false
   * @default false
   */
  disabled?: boolean;
}
