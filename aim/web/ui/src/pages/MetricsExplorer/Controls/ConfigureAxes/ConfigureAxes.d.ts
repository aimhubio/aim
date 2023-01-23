import { IBaseComponentProps } from 'modules/BaseExplorer/types';
import { AlignmentOptionsEnum, ScaleEnum } from 'utils/d3';
import { CONTROLS_DEFAULT_CONFIG } from 'config/controls/controlsDefaultConfig';

export interface IConfigureAxesProps extends IBaseComponentProps {
  visualizationName: string;
}

export interface IAxesPropsConfig {
  alignment: IAxesAlignmentConfig;
  axesScale: IAxesScaleConfig;
}

export interface IAxesAlignmentConfig {
  metric?: string;
  type: AlignmentOptionsEnum;
}

export interface IAxesScaleConfig {
  type: IAxesScaleType;
  range: IAxesScaleRange;
}

export interface IAxesScaleRange {
  yAxis: { min?: number; max?: number };
  xAxis: { min?: number; max?: number };
}

export interface IAxesScaleType {
  xAxis: ScaleEnum;
  yAxis: ScaleEnum;
}


// export interface IAxesRangeValue {
//   min?: number;
//   max?: number;
// }
//
// export interface IAxesRangeValidation {
//   min: boolean;
//   max: boolean;
// }

