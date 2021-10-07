import * as analytics from 'services/analytics';
import { setItem } from '../storage';
import { encode } from '../encoder/encoder';
import { IModel, State } from 'types/services/models/model';
import { ResizeModeEnum } from '../../config/enums/tableEnums';

export default function onTableResizeModeChange<M extends State>(
  mode: ResizeModeEnum,
  model: IModel<M>,
  appName: string,
): void {
  const configData = model?.getState()?.config;

  if (configData?.table) {
    const table = {
      ...configData.table,
      resizeMode: mode,
    };
    const config = {
      ...configData,
      table,
    };
    model.setState({
      config,
    });
    setItem(`${appName}Table`, encode(table));
  }
  analytics.trackEvent(
    `[${appName}Explorer][Table] Set table view mode to "${mode}"`,
  );
}
