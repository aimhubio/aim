import { IModel, State } from 'services/models/model';

export interface IOnTableDiffShowParams<M extends State> {
  model: IModel<M>;
  onColumnsVisibilityChange: (hiddenColumns: string[]) => void;
  page: string;
}
