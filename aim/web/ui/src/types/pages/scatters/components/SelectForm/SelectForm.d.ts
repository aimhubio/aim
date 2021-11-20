import {
  ISelectOption,
  ISelectConfig,
} from 'services/models/explorer/createAppModel';

export interface ISelectFormProps {
  selectedOptionsData: ISelectConfig;
  onSelectOptionsChange: (options: ISelectOption[]) => void;
  onSelectRunQueryChange: (query: string) => void;
  onSelectAdvancedQueryChange: (query: string) => void;
  toggleSelectAdvancedMode: () => void;
  onSearchQueryCopy: () => void;
}
