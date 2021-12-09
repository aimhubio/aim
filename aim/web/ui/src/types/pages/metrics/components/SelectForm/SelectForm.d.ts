import { ISelectOption } from 'services/models/explorer/createAppModel';

import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

export interface ISelectFormProps {
  requestIsPending: boolean;
  selectedMetricsData: IAppModelConfig['select'];
  onMetricsSelectChange: (options: ISelectOption[]) => void;
  onSelectRunQueryChange: (query: string) => void;
  onSelectAdvancedQueryChange: (query: string) => void;
  toggleSelectAdvancedMode: () => void;
  onSearchQueryCopy: () => void;
}
