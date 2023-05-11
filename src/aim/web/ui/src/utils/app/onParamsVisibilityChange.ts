import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

import { encode } from 'utils/encoder/encoder';
import { setItem } from 'utils/storage';

export default function onParamVisibilityChange<M extends State>({
  metricsKeys,
  model,
  appName,
  updateModelData,
}: {
  metricsKeys: string[];
  model: IModel<M>;
  appName: string;
  updateModelData: (
    configData: IAppModelConfig,
    shouldURLUpdate?: boolean,
  ) => void;
}) {
  const configData = model.getState()?.config;
  const processedData = model.getState()?.data;
  if (configData?.table && processedData) {
    const table = {
      ...configData.table,
      hiddenMetrics:
        metricsKeys[0] === 'all'
          ? Object.values(processedData)
              .map((metricCollection) =>
                metricCollection.data.map((metric: any) => metric.key),
              )
              .flat()
          : metricsKeys,
    };
    const configUpdate = {
      ...configData,
      table,
    };
    model.setState({ config: configUpdate });
    setItem(`${appName.toLowerCase()}Table`, encode(table));
    updateModelData(configUpdate);
  }
  analytics.trackEvent(
    `[${appName}Explorer][Table] ${
      metricsKeys[0] === 'all'
        ? 'Visualize all hidden metrics from table'
        : 'Hide all metrics from table'
    }`,
  );
}
