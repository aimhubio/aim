import { IAppModelConfig } from 'services/models/explorer/createAppModel';
import { ISelectOption } from 'services/models/explorer/createAppModel';

export interface ISelectFormProps {
  onParamsSelectChange: (options: ISelectOption[]) => void;
  selectedParamsData: IAppModelConfig['select'];
  onSelectRunQueryChange: (query: string) => void;
}

// export interface ISelectParamsOption {
//   label: string;
//   group: string;
//   color: string;
//   type: string;
//   value?: {
//     option_name: string;
//     context: object | null | any;
//   };
// }
