import { CheckboxProps } from '@radix-ui/react-checkbox';

/**
 * The Checkbox component is a form component that allows users to select one or more options from a list.
 * @description The interface for the Checkbox component.
 */
export interface ICheckboxProps extends CheckboxProps {
  /**
   * The label of the checkbox.
   * @description The label of the checkbox.
   * @default ''
   * @type string
   * @optional
   */
  label?: string;
  /**
   * The checked state of the checkbox.
   * @description The checked state of the checkbox.
   * @default false
   */
  checked?: CheckboxProps['checked'];
  /**
   * The default checked state of the checkbox.
   * @description The default checked state of the checkbox.
   * @default false
   */
  defaultChecked?: boolean;
  /**
   * The required state of the checkbox.
   * @description The required state of the checkbox.
   * @default false
   */
  required?: boolean;
  /**
   * The callback function that is fired when the checked state of the checkbox is changed.
   * @description The callback function that is fired when the checked state of the checkbox is changed.
   * @param checked The checked state of the checkbox.
   * @default () => {}
   */
  onCheckedChange?: (checked: CheckboxProps['checked']) => void;
  /**
   * @description disabled state
   * @default false
   * @type boolean
   */
  disabled?: boolean;
}
