export interface ISliderWithInputProps {
  sliderTitle: string;
  countInputTitle: string;
  sliderTitleTooltip?: string;
  countTitleTooltip?: string;
  min: number;
  max: number;
  selectedRangeValue: number[];
  selectedCountValue: number;
  sliderType?: 'range' | 'single';
  onSearch: () => void;
  onCountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRangeChange: (newValue: number[] | number) => void;
}
