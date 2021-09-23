import { IModel, State } from 'types/services/models/model';

export default function onSelectRunQueryChange<T extends State>(
  query: string,
  model: IModel<T>,
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
