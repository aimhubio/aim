import {
  ISelectConfig,
  ISelectOption,
} from 'types/services/models/explorer/createAppModel';

export interface ISelectFormProps {
  requestIsPending: boolean;
  selectedTextsData: ISelectConfig;
  selectFormData: { options: ISelectOption[]; suggestions: string[] };
  onTextsExplorerSelectChange: (options: ISelectOption[]) => void;
  onSelectRunQueryChange: (query: string) => void;
  searchButtonDisabled: boolean;
}
