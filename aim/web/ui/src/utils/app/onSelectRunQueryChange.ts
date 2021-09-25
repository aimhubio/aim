import { IModel, State } from 'types/services/models/model';

export default function onSelectRunQueryChange<M extends State>(
  query: string,
  model: IModel<M>,
) {
  const configData = model.getState()?.config;
  if (configData?.select) {
    model.setState({
      config: {
        ...configData,
        select: { ...configData.select, query },
      },
    });
  }
}
