import { IModel, State } from 'services/models/model';

export interface IOnTableDiffShowParams<T extends State> {
  model: IModel<T>;
  onColumnsVisibilityChange: (hiddenColumns: string[]) => void;
  page: string;
}
