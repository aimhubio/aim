import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';
import { encode } from 'utils/encoder/encoder';
import { setItem } from 'utils/storage';

export default function onMetricVisibilityChange<T extends State>(
  metricsKeys: string[],
  model: IModel<T>,
) {
  const configData = model.getState()?.config;
  const processedData = model.getState()?.data;
  if (configData?.table && processedData) {
    const table = {
      ...configData.table,
      hiddenMetrics:
        metricsKeys[0] === 'all'
          ? Object.values(processedData)
              .map((metricCollection) =>
                metricCollection.data.map(
                  (metric: Record<string, any>) => metric.key,
                ),
              )
              .flat()
          : metricsKeys,
    };
    const config = {
      ...configData,
      table,
    };
    model.setState({
      config,
    });
    setItem('metricsTable', encode(table));
    // updateModelData(config);
  }
  analytics.trackEvent(
    `[MetricsExplorer][Table] ${
      metricsKeys[0] === 'all'
        ? 'Visualize all hidden metrics from table'
        : 'Hide all metrics from table'
    }`,
  );
}
