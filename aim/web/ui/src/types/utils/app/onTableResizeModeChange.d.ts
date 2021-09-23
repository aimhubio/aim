import { ResizeModeEnum } from 'config/enums/tableEnums';
import { IModel } from 'services/models/model';
import { State } from 'types/services/models/model';

export interface IOnTableResizeModeChangeParams<T extends State> {
  mode: ResizeModeEnum;
  model: IModel<T>;
  page: string;
}
