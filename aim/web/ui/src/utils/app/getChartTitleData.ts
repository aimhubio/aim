import {
  IChartTitle,
  IChartTitleData,
  IMetricsCollection,
} from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';

export default function getChartTitleData<D, M extends State>(
  processedData: IMetricsCollection<D>[],
  model: IModel<M>,
): IChartTitleData {
  if (!processedData) {
    return {};
  }
  const configData = model.getState().config;
  const groupData = configData?.grouping;
  let chartTitleData: IChartTitleData = {};
  processedData.forEach((metricsCollection) => {
    if (!chartTitleData[metricsCollection.chartIndex]) {
      chartTitleData[metricsCollection.chartIndex] = groupData.chart.reduce(
        (acc: IChartTitle, groupItemKey: string) => {
          if (metricsCollection.config?.hasOwnProperty(groupItemKey)) {
            acc[groupItemKey.replace('run.params.', '')] = JSON.stringify(
              metricsCollection.config[groupItemKey] || 'None',
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
