import { IValidationMetadata, IValidationPatterns } from 'components/kit/Input';

export interface IRangeSliderWithInputItem {
  sliderName: string;
  inputName: string;
  sliderTitle: string;
  inputTitle: string;
  sliderTitleTooltip: string;
  inputTitleTooltip: string;
  /**
   * min, max values
   */
  rangeEndpoints: [number, number];
  selectedRangeValue: [number, number];
  inputValue: number;
  sliderType: 'single' | 'range'; // This type is same as SliderWithInput component sliderType prop type.
  inputValidationPatterns?: IValidationPatterns;
  infoPropertyName?: string;
}

export type RangeSliderData = IRangeSliderWithInputItem[];

export interface IRangeSliderPanelProps {
  items?: RangeSliderData;
  onApply: () => void;
  onInputChange: (
    name: string,
    value: number,
    metadata?: IValidationMetadata,
  ) => void;
  onRangeSliderChange: (name: string, newValue: number[] | number) => void;
  applyButtonDisabled: boolean;
}
