import { IModel, State } from 'types/services/models/model';

export default function onSelectRunQueryChange<M extends State>(
  query: string,
  model: IModel<M>,
  updateURL: any,
) {
  const configData = model.getState()?.config;
  if (configData?.select) {
    const newConfig = {
      ...configData,
      select: { ...configData.select, query },
    };

    updateURL(newConfig);

    model.setState({ config: newConfig });
  }
}
