import { SwitchProps } from '@radix-ui/react-switch';

/**
 * Switch component props
 */
export interface ISwitchProps extends SwitchProps {
  /**
   * Switch checked state
   * @default false
   */
  checked?: boolean;
  /**
   * Switch disabled state
   * @default false
   */
  disabled?: boolean;
  /**
   * Switch default checked state
   * @default false
   */
  defaultChecked?: boolean;
  /**
   * Switch required state
   * @default false
   */
  required?: boolean;
  /**
   * Switch size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
}
