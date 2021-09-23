import { IModel } from 'services/models/model';

export interface IOnTableResizeEndParams<T extends State> {
  tableHeight: string;
  model: IModel<T>;
  page: string;
}
