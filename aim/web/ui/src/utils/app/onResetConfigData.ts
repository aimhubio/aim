import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

export default function onResetConfigData<M extends State>({
  model,
  getConfig,
  updateModelData,
}: {
  model: IModel<M>;
  getConfig: () => any;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
}): void {
  const configData = model.getState()?.config;
  if (configData) {
    configData.grouping = {
      ...getConfig().grouping,
    };
    configData.chart = { ...getConfig().chart };
    updateModelData(configData, true);
  }
}
