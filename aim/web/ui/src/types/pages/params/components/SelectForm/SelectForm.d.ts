import { ISelectOption } from 'services/models/explorer/createAppModel';

import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

export interface ISelectFormProps {
  selectFormData: { options: ISelectOption[]; suggestions: Record<any, any> };
  requestIsPending: boolean;
  isDisabled?: boolean;
  selectedParamsData: IAppModelConfig['select'];
  onParamsSelectChange: (options: ISelectOption[]) => void;
  onSelectRunQueryChange: (query: string) => void;
}
