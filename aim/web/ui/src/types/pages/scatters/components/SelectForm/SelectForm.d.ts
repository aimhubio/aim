import {
  ISelectOption,
  ISelectConfig,
} from 'services/models/explorer/createAppModel';

export interface ISelectFormProps {
  requestIsPending: boolean;
  isDisabled?: boolean;
  selectedOptionsData: ISelectConfig;
  selectFormData: { options: ISelectOption[]; suggestions: string[] };
  onSelectOptionsChange: (options: ISelectOption[]) => void;
  onSelectRunQueryChange: (query: string) => void;
}
