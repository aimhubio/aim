import { IModel, State } from 'types/services/models/model';
import updateURL from './updateURL';

export default function onSelectAdvancedQueryChange<M extends State>({
  query,
  model,
  appName,
}: {
  query: string;
  model: IModel<M>;
  appName: string;
}) {
  const configData = model.getState()?.config;
  if (configData?.select) {
    const newConfig = {
      ...configData,
      select: { ...configData.select, advancedQuery: query },
    };

    updateURL({ configData: newConfig, appName });

    model.setState({ config: newConfig });
  }
}
