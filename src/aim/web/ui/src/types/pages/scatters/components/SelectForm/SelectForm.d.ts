import {
  ISelectOption,
  ISelectConfig,
} from 'services/models/explorer/createAppModel';

import { ISyntaxErrorDetails } from 'types/components/NotificationContainer/NotificationContainer';

export interface ISelectFormProps {
  requestIsPending: boolean;
  isDisabled?: boolean;
  selectedOptionsData: ISelectConfig;
  selectFormData: {
    options: ISelectOption[];
    suggestions: string[];
    error: ISyntaxErrorDetails;
  };
  onSelectOptionsChange: (options: ISelectOption[]) => void;
  onSelectRunQueryChange: (query: string) => void;
}
