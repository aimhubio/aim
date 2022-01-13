import {
  ISelectOption,
  ISelectConfig,
} from 'services/models/explorer/createAppModel';

export interface ISelectFormProps {
  requestIsPending: boolean;
  selectedOptionsData: ISelectConfig;
  selectFormOptions: ISelectOption[];
  onSelectOptionsChange: (options: ISelectOption[]) => void;
  onSelectRunQueryChange: (query: string) => void;
}
