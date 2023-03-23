import { RadioGroupItemProps } from '@radix-ui/react-radio-group';

export interface IRadioItemProps extends RadioGroupItemProps {
  /**
   * The value of the radio button.
   * @default ''
   */
  value: string;
  /**
   * The disabled state of the radio button.
   * @default false
   */
  disabled?: boolean;
  /**
   * The required state of the radio button.
   * @default false
   */
  required?: boolean;
}
