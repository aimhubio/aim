import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

import { encode } from 'utils/encoder/encoder';
import { setItem } from 'utils/storage';

export default function onRowVisibilityChange<M extends State>({
  metricKey,
  model,
  appName,
  updateModelData,
}: {
  metricKey: string;
  model: IModel<M>;
  appName: string;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
}) {
  const configData = model.getState()?.config;
  if (configData?.table) {
    let hiddenMetrics = configData?.table?.hiddenMetrics || [];
    if (hiddenMetrics?.includes(metricKey)) {
      hiddenMetrics = hiddenMetrics.filter(
        (hiddenMetric: string) => hiddenMetric !== metricKey,
      );
    } else {
      hiddenMetrics = [...hiddenMetrics, metricKey];
    }
    const table = {
      ...configData.table,
      hiddenMetrics,
    };
    const config = {
      ...configData,
      table,
    };
    model.setState({ config });
    setItem(`${appName}Table`, encode(table));
    updateModelData(config);
  }
}
