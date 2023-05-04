import { IBaseComponentProps } from 'modules/BaseExplorer/types';

import {
  IAxesAlignmentConfig,
  IAxesScaleRange,
  IAxesScaleType,
} from '../index';

export interface IConfigureAxesPopoverProps extends IBaseComponentProps {
  visualizationName: string;
}

export interface IAlignmentProps extends IBaseComponentProps {
  visualizationName: string;
  alignmentConfig: IAxesAlignmentConfig;
}

export interface IAxesRangeProps extends IBaseComponentProps {
  visualizationName: string;
  axesRangeConfig: IAxesScaleRange;
}

export interface IAxesTypeProps extends IBaseComponentProps {
  visualizationName: string;
  axesTypeConfig: IAxesScaleType;
}
