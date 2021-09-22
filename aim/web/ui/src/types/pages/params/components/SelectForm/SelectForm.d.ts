import { IParamsAppConfig } from 'types/services/models/params/paramsAppModel';

export interface ISelectFormProps {
  onParamsSelectChange: IParamsAppConfig['onParamsSelectChange'];
  selectedParamsData: IParamsAppConfig['select'];
  onSelectRunQueryChange: (query: string) => void;
}
export interface ISelectParamsOption {
  label: string;
  group: string;
  color: string;
  type: string;
  value?: {
    param_name: string;
    context: object;
  };
}
