import { IBaseComponentProps } from 'modules/BaseExplorer/types';

export interface IBoxPropertiesProps extends IBaseComponentProps {
  visualizationName: string;
}

export interface IBoxConfigState {
  isInitial: boolean;
  width: number;
  height: number;
  gap: number;
}
