import { IModel, State } from 'types/services/models/model';

export default function onResetConfigData<M extends State>(
  model: IModel<M>,
  getConfig: () => any,
  updateModelData: any,
): void {
  const configData = model.getState()?.config;
  if (configData) {
    configData.grouping = {
      ...getConfig().grouping,
    };
    configData.chart = { ...getConfig().chart };
    updateModelData(configData);
  }
}
