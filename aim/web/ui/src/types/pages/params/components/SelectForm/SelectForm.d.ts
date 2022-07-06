import { ISelectOption } from 'services/models/explorer/createAppModel';

import { ISyntaxErrorDetails } from 'types/components/NotificationContainer/NotificationContainer';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

export interface ISelectFormProps {
  selectFormData: {
    options: ISelectOption[];
    suggestions: Record<any, any>;
    error: ISyntaxErrorDetails;
  };
  requestIsPending: boolean;
  isDisabled?: boolean;
  selectedParamsData: IAppModelConfig['select'];
  onParamsSelectChange: (options: ISelectOption[]) => void;
  onSelectRunQueryChange: (query: string) => void;
}
