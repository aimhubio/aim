import { RadioGroupItemProps } from '@radix-ui/react-radio-group';

export interface IRadioProps extends RadioGroupItemProps {
  /**
   * The value of the radio button.
   * @default ''
   */
  value: string;
}
