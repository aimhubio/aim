import { IBaseComponentProps } from 'modules/BaseExplorer/types';

import { SmoothingAlgorithmEnum } from 'utils/smoothingData';
import { CurveEnum } from 'utils/d3';

export interface ISmoothingProps extends IBaseComponentProps {
  visualizationName: string;
}

export interface ISmoothingConfig {
  algorithm: SmoothingAlgorithmEnum;
  factor: number;
  curveInterpolation: CurveEnum;
  isApplied: boolean;
}
