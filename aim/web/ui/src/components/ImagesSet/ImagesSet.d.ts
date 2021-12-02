import { IFocusedState } from 'types/services/models/metrics/metricsAppModel';

export interface IImageSetProps {
  data: any;
  orderedMap: { [key: string]: any };
  onScroll: () => void;
  onListScroll: ({ scrollOffset: number }) => void;
  addUriToList: (blobUrl: string) => void;
  index?: number;
  imagesSetKey: number;
  imageSetWrapperHeight?: number;
  imageSetWrapperWidth?: number;
  imageHeight: number;
  syncHoverState?: (args: any) => void;
  focusedState: IFocusedState;
  hoveredImageKey: string;
  setImageFullMode: (v: boolean) => void;
  setImageFullModeData: (v: string) => void;
}
