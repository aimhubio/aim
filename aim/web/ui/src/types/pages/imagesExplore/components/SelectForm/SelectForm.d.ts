import { ISyntaxErrorDetails } from 'types/components/NotificationContainer/NotificationContainer';
import { ISelectOption } from 'types/services/models/explorer/createAppModel';

export interface ISelectFormProps {
  //   selectedMetricsData: IMetricAppConfig['select'];
  requestIsPending: boolean;
  isDisabled?: boolean;
  selectedImagesData: any;
  selectFormData: {
    options: ISelectOption[];
    suggestions: Record<any, any>;
    advancedSuggestions: Record<any, any>;
    error: ISyntaxErrorDetails;
    advancedError: ISyntaxErrorDetails;
  };
  onImagesExploreSelectChange: (options: ISelectOption[]) => void;
  onSelectRunQueryChange: (query: string) => void;
  onSelectAdvancedQueryChange: (query: string) => void;
  toggleSelectAdvancedMode: () => void;
  onSearchQueryCopy: () => void;
  searchButtonDisabled: boolean;
}
