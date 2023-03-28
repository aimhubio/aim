import { IBaseComponentProps } from 'modules/BaseExplorer/types';

export interface ICaptionPropertiesProps extends IBaseComponentProps {
  visualizationName: string;
}

export interface ICaptionProperties {
  displayBoxCaption: boolean;
  selectedFields: string[];
  isInitial: boolean;
}

export type SelectOption = {
  label: string;
  value: string;
  group: string;
};
