import { IModel, State } from 'types/services/models/model';

export default function onSelectAdvancedQueryChange<M extends State>(
  query: string,
  model: IModel<M>,
  updateURL: any,
) {
  const configData = model.getState()?.config;
  if (configData?.select) {
    const newConfig = {
      ...configData,
      select: { ...configData.select, advancedQuery: query },
    };

    updateURL(newConfig);

    model.setState({ config: newConfig });
  }
}
