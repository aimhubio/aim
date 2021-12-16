import { ISelectOption } from 'types/services/models/explorer/createAppModel';

export interface ISelectFormProps {
  //   selectedMetricsData: IMetricAppConfig['select'];
  requestIsPending: boolean;
  selectedImagesData: any;
  onImagesExploreSelectChange: (options: ISelectOption[]) => void;
  onSelectRunQueryChange: (query: string) => void;
  onSelectAdvancedQueryChange: (query: string) => void;
  toggleSelectAdvancedMode: () => void;
  onSearchQueryCopy: () => void;
  searchButtonDisabled: boolean;
}
