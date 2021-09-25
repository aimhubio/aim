import { IModel } from 'services/models/model';

export interface IOnTableResizeEndParams<M extends State> {
  tableHeight: string;
  model: IModel<M>;
  appName: string;
}
