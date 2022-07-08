import { ISelectOption } from 'services/models/explorer/createAppModel';

import { ISyntaxErrorDetails } from 'types/components/NotificationContainer/NotificationContainer';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

export interface ISelectFormProps {
  requestIsPending: boolean;
  isDisabled?: boolean;
  selectedMetricsData: IAppModelConfig['select'];
  selectFormData: {
    options: ISelectOption[];
    suggestions: Record<any>;
    advancedSuggestions?: Record<any>;
    error: ISyntaxErrorDetails;
    advancedError: ISyntaxErrorDetails;
  };
  onMetricsSelectChange: (options: ISelectOption[]) => void;
  onSelectRunQueryChange: (query: string) => void;
  onSelectAdvancedQueryChange: (query: string) => void;
  toggleSelectAdvancedMode: () => void;
  onSearchQueryCopy: () => void;
}
