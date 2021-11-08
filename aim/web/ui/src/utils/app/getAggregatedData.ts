import COLORS from 'config/colors/colors';

import { IMetric } from 'types/services/models/metrics/metricModel';
import {
  IAggregatedData,
  IMetricsCollection,
} from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';

export default function getAggregatedData<M extends State>({
  processedData,
  model,
}: {
  processedData: IMetricsCollection<IMetric>[];
  model: IModel<M>;
}): IAggregatedData[] {
  if (!processedData) {
    return [];
  }
  const paletteIndex: number =
    model.getState().config?.grouping?.paletteIndex || 0;

  let aggregatedData: IAggregatedData[] = [];

  processedData.forEach((metricsCollection, index) => {
    aggregatedData.push({
      key: metricsCollection.key,
      area: {
        min: metricsCollection.aggregation?.area.min || null,
        max: metricsCollection.aggregation?.area.max || null,
      },
      line: metricsCollection.aggregation?.line || null,
      chartIndex: metricsCollection.chartIndex || 0,
      color:
        metricsCollection.color ||
        COLORS[paletteIndex][index % COLORS[paletteIndex].length],
      dasharray: metricsCollection.dasharray || '0',
    });
  });

  return aggregatedData;
}
