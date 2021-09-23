import { IModel } from 'services/models/model';

export interface IOnTableDiffShowParams {
  model: IModel<any>;
  onColumnsVisibilityChange: (hiddenColumns: string[]) => void;
  page: string;
}
