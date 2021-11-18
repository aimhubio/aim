import { IModel, State } from 'types/services/models/model';

export default function onSelectRunQueryChange<M extends State>({
  query,
  model,
}: {
  query: string;
  model: IModel<M>;
}) {
  const configData = model.getState()?.config;
  if (configData?.select) {
    const newConfig = {
      ...configData,
      select: { ...configData.select, advancedQuery: query, query },
    };

    model.setState({ config: newConfig });
  }
}
