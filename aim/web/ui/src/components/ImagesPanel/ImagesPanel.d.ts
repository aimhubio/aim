export interface IImagesPanelProps {
  imagesData: any;
  stepSlice: number[];
  indexSlice: number[];
  indexRange: number[];
  stepRange: number[];
  indexInterval: number;
  stepInterval: number;
  onIndexSliceChange: (
    event: ChangeEvent<{}>,
    newValue: number | number[],
  ) => void;
  onStepSliceChange: (
    event: ChangeEvent<{}>,
    newValue: number | number[],
  ) => void;
  onStepIntervalChange: (event: ChangeEvent<{ value: number }>) => void;
  onIndexIntervalChange: (event: ChangeEvent<{ value: number }>) => void;
}
