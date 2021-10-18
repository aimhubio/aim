import * as analytics from 'services/analytics';
import { setItem } from '../storage';
import { encode } from '../encoder/encoder';
import { IModel, State } from 'types/services/models/model';
import { ResizeModeEnum } from 'config/enums/tableEnums';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

export default function onTableResizeModeChange<M extends State>({
  mode,
  model,
  appName,
  updateModelData,
}: {
  mode: ResizeModeEnum;
  model: IModel<M>;
  appName: string;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
}): void {
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
    model.setState({ config });
    setItem(`${appName}Table`, encode(table));
    updateModelData(config);
  }
  analytics.trackEvent(
    `[${appName}Explorer][Table] Set table view mode to "${mode}"`,
  );
}
