import {
  IChartTitle,
  IChartTitleData,
  IMetricsCollection,
} from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';
import { formatValue } from '../formatValue';

export default function getChartTitleData<D, M extends State>({
  processedData,
  model,
}: {
  processedData: IMetricsCollection<D>[];
  model: IModel<M>;
}): IChartTitleData {
  if (!processedData) {
    return {};
  }
  const groupData = model.getState()?.config?.grouping;
  let chartTitleData: IChartTitleData = {};
  processedData.forEach((metricsCollection) => {
    if (!chartTitleData[metricsCollection.chartIndex]) {
      chartTitleData[metricsCollection.chartIndex] = groupData.chart.reduce(
        (acc: IChartTitle, groupItemKey: string) => {
          if (metricsCollection.config?.hasOwnProperty(groupItemKey)) {
            acc[groupItemKey.replace('run.params.', '')] = formatValue(
              metricsCollection.config[groupItemKey],
            );
          }
          return acc;
        },
        {},
      );
    }
  });
  return chartTitleData;
}
