import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

export default function onShuffleChange<M extends State>({
  name,
  model,
  updateModelData,
}: {
  name: 'color' | 'stroke';
  model: IModel<M>;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
}) {
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
