import {
  ISelectConfig,
  ISelectOption,
} from 'types/services/models/explorer/createAppModel';

export interface ISelectFormProps {
  requestIsPending: boolean;
  selectFormData: { options: ISelectOption[]; suggestions: string[] };
  onSelectAdvancedQueryChange: (query: string) => void;
  toggleSelectAdvancedMode: () => void;
  onSearchQueryCopy: () => void;
  selectedTextsData: ISelectConfig;
  onTextsExplorerSelectChange: (options: ISelectOption[]) => void;
  onSelectRunQueryChange: (query: string) => void;
  searchButtonDisabled: boolean;
}
