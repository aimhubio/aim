import { IImagesPanelProps } from '../ImagesPanel';

export interface IImagesExploreRangePanelProps {
  recordSlice: number[];
  indexSlice: number[];
  indexRange: number[];
  stepRange: number[];
  indexDensity: number;
  recordDensity: number;
  applyButtonDisabled: boolean;
  onSliceRangeChange: IImagesPanelProps['onSliceRangeChange'];
  onDensityChange: IImagesPanelProps['onDensityChange'];
}
