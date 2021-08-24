import { IParamsAppConfig } from 'types/services/models/params/paramsAppModel';

export interface ISelectFormProps {
  onParamsSelectChange: IParamsAppConfig['onParamsSelectChange'];
  selectedParamsData: ISelectParamsOption[];
}
export interface ISelectParamsOption {
  label: string;
  group: string;
  color: string;
  value: {
    param_name: string;
    context: object;
  };
}
