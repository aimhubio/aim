import { ISelectOption } from 'services/models/explorer/createAppModel';
import { IAppModelConfig } from 'services/models/explorer/createAppModel';

export interface ISelectFormProps {
  selectedMetricsData: IAppModelConfig['select'];
  onMetricsSelectChange: (options: ISelectOption[]) => void;
  onSelectRunQueryChange: (query: string) => void;
  onSelectAdvancedQueryChange: (query: string) => void;
  toggleSelectAdvancedMode: () => void;
  onSearchQueryCopy: () => void;
}
