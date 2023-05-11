import { IBaseComponentProps } from 'modules/BaseExplorer/types';

export interface ITextRendererModeProps extends IBaseComponentProps {
  visualizationName: string;
}

export interface ITextRendererModeState {
  type: string;
}
