import { IBaseComponentProps } from 'modules/BaseExplorer/types';

import { ZoomEnum } from 'utils/d3';

export interface IZoomProps extends IBaseComponentProps {
  visualizationName: string;
}

export interface IZoomConfig {
  mode: ZoomEnum;
  history: {
    id: string;
    xValues: [number, number];
    yValues: [number, number];
  }[];
  active: boolean;
  isInitial: boolean;
}
