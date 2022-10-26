import { IconName } from 'components/kit/Icon';

export interface IControlsButtonProps {
  /**
   * @description Popover open state
   * @example false
   */
  open: boolean;
  /**
   * @description Popover has applied values
   * @example false
   * @default false
   */
  hasAppliedValues?: boolean;
  /**
   * @description Control popover triggers applied values count
   * @example 2
   * @default 0
   */
  appliedValuesCount?: number;
  /**
   * @description Control popover trigger right icon props
   * @example { name: 'arrow-down', onClick: () => {} }
   */
  rightIcon?: {
    name: IconName;
    onClick: () => void;
  };
  /**
   * @description Control popover trigger left icon
   * @example 'ignore-outliers'
   */
  leftIcon?: IconName;
  /**
   * @description Control popover trigger children
   */
  children: React.ReactNode;
  /**
   * @description Control popover trigger sizes
   * @example 'md'
   */
  size?: 'md' | 'lg' | 'xl';
  /**
   * @description The disabled state of the button
   */
  disabled?: false;
}
