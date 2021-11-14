export interface IImagesPanelProps {
  imagesData: any;
  imagesBlobs: { [key: string]: value };
  imagesWrapperRef: React.MutableRefObject<any>;
  recordSlice: number[];
  indexSlice: number[];
  indexRange: number[];
  stepRange: number[];
  indexDensity: number;
  recordDensity: number;
  onIndexSliceChange: (
    event: ChangeEvent<{}>,
    newValue: number | number[],
  ) => void;
  onRecordSliceChange: (
    event: ChangeEvent<{}>,
    newValue: number | number[],
  ) => void;
  onRecordDensityChange: (event: ChangeEvent<{ value: number }>) => void;
  onIndexDensityChange: (event: ChangeEvent<{ value: number }>) => void;
  getImagesBlobsData: (uris: string[]) => Promise;
  isLoading: boolean;
  searchButtonDisabled: boolean;
  panelResizing: boolean;
}
