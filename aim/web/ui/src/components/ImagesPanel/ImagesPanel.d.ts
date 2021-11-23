import React from 'react';

export interface IImagesPanelProps {
  imagesData: any;
  imagesBlobs: { [key: string]: value };
  recordSlice: number[];
  indexSlice: number[];
  indexRange: number[];
  stepRange: number[];
  indexDensity: number;
  recordDensity: number;
  onSliceRangeChange: (key: string, newValue: number[] | number) => void;
  onDensityChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  getImagesBlobsData: (uris: string[]) => Promise;
  isLoading: boolean;
  applyButtonDisabled: boolean;
  isRangePanelShow: boolean;
  panelResizing: boolean;
  imageWrapperOffsetHeight: number;
  imageWrapperOffsetWidth: number;
  controls: React.ReactNode;
}
