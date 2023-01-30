import { IBaseComponentProps } from 'modules/BaseExplorer/types';

import { AlignmentOptionsEnum, ScaleEnum } from 'utils/d3';

export interface IConfigureAxesProps extends IBaseComponentProps {
  visualizationName: string;
}

export interface IAxesPropsConfig {
  alignment: IAxesAlignmentConfig;
  axesScaleType: IAxesScaleType;
  axesScaleRange: IAxesScaleRange;
}

export interface IAxesAlignmentConfig {
  metric?: string;
  type: AlignmentOptionsEnum;
}

export interface IAxesScaleRange {
  yAxis: { min?: number; max?: number };
  xAxis: { min?: number; max?: number };
}

export interface IAxesScaleType {
  xAxis: ScaleEnum;
  yAxis: ScaleEnum;
}
