export interface ICaptionPropertiesProps {
  engine: IBaseComponentProps['engine'];
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
