import { IModel } from 'services/models/model';

export interface IOnTableResizeEndParams {
  tableHeight: string;
  model: IModel<any>;
  page: string;
}
