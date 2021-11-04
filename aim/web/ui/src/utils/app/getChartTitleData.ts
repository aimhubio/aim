import {
  IChartTitle,
  IChartTitleData,
  IGroupingSelectOption,
  IMetricsCollection,
} from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';

import { formatValue } from '../formatValue';
import getValueByField from '../getValueByField';

export default function getChartTitleData<D, M extends State>({
  processedData,
  groupingSelectOptions,
  model,
}: {
  processedData: IMetricsCollection<D>[];
  groupingSelectOptions: IGroupingSelectOption[];
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
            acc[getValueByField(groupingSelectOptions || [], groupItemKey)] =
              formatValue(metricsCollection.config[groupItemKey]);
          }
          return acc;
        },
        {},
      );
    }
  });
  return chartTitleData;
}
