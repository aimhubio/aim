import { ResizeModeEnum } from 'config/enums/tableEnums';
import { IModel } from 'services/models/model';
import { State } from 'types/services/models/model';

export interface IOnTableResizeModeChangeParams<M extends State> {
  mode: ResizeModeEnum;
  model: IModel<M>;
  appName: string;
}
