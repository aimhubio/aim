import { IModel, State } from 'types/services/models/model';
import { ISelectOption } from 'types/services/models/explorer/createAppModel';

export default function onSelectOptionsChange<
  M extends State,
  D extends Partial<ISelectOption[]>,
>({ data, model }: { data: D; model: IModel<M> }) {
  const configData = model.getState()?.config;
  if (configData?.select) {
    const newConfig = {
      ...configData,
      select: { ...configData.select, options: data },
    };

    model.setState({ config: newConfig });
  }
}
