import { IMediaPanelProps } from '../MediaPanel';

export interface IImagesExploreRangePanelProps {
  recordSlice: number[];
  indexSlice: number[];
  indexRange: number[];
  stepRange: number[];
  indexDensity: number;
  recordDensity: number;
  applyButtonDisabled: boolean;
  onSliceRangeChange: IMediaPanelProps['onSliceRangeChange'];
  onDensityChange: IMediaPanelProps['onDensityChange'];
}
