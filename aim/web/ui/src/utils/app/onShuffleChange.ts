import { IModel, State } from 'types/services/models/model';

export default function onShuffleChange<M extends State>(
  name: 'color' | 'stroke',
  model: IModel<M>,
  updateModelData: any,
) {
  const configData = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = {
      ...configData.grouping,
      seed: {
        ...configData.grouping.seed,
        [name]: configData.grouping.seed[name] + 1,
      },
    };
    updateModelData(configData);
  }
}
