import { IBaseComponentProps } from 'modules/BaseExplorer/types';

export interface IConfigureTooltipProps extends IBaseComponentProps {
  visualizationName: string;
}

export enum TooltipAppearanceEnum {
  Top = 'top',
  Auto = 'auto',
  Bottom = 'bottom',
}

export interface ITooltipConfig {
  appearance: TooltipAppearanceEnum;
  display: boolean;
  selectedFields: string[];
  isInitial: boolean;
}
