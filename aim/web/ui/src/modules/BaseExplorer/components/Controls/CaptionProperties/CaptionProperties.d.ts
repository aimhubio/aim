export interface ICaptionPropertiesProps {
  engine: IBaseComponentProps['engine'];
}

export interface ICaptionProperties {
  displayBoxCaption: boolean;
  selectedFields: SelectedField[];
  isInitial: boolean;
}

export type SelectedField = {
  label: string;
  value: string;
  group: string;
};
