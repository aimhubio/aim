import { IModel, State } from 'types/services/models/model';

export default function onSelectAdvancedQueryChange<M extends State>(
  query: string,
  model: IModel<M>,
) {
  const configData = model.getState()?.config;
  if (configData?.select) {
    model.setState({
      config: {
        ...configData,
        select: { ...configData.select, advancedQuery: query },
      },
    });
  }
}
