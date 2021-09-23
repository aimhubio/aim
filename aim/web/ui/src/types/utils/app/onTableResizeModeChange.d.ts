import { ResizeModeEnum } from 'config/enums/tableEnums';
import { IModel } from 'services/models/model';

export interface IOnTableResizeModeChangeParams {
  mode: ResizeModeEnum;
  model: IModel<any>;
  page: string;
}
