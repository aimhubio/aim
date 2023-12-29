import { SliderProps } from '@radix-ui/react-slider';
export interface ISliderProps extends SliderProps {
  /**
   * Marks to be displayed on the slider.
   * @default []
   * @example [{ label: '0', value: 0 }, { label: '100', value: 100 }]
   * @optional
   */
  marks?: { label?: string; value: number }[];
  /**
   * Whether to show the label of the slider.
   * @default true
   */
  showLabel?: boolean;
}
