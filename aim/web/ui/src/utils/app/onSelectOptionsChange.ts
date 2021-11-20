import { IModel, State } from 'types/services/models/model';
import { ISelectOption } from 'types/services/models/explorer/createAppModel';

import updateURL from './updateURL';

export default function onSelectOptionsChange<
  M extends State,
  D extends Partial<ISelectOption[]>,
>({ data, model, appName }: { data: D; model: IModel<M>; appName: string }) {
  const configData = model.getState()?.config;
  if (configData?.select) {
    const newConfig = {
      ...configData,
      select: { ...configData.select, options: data },
    };

    updateURL({ configData: newConfig, appName });
    model.setState({ config: newConfig });
  }
}
