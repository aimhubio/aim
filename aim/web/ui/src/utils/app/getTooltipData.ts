import _ from 'lodash-es';

import {
  IGroupingSelectOption,
  IMetricsCollection,
  ITooltipData,
} from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';

import getGroupConfig from './getGroupConfig';

export default function getTooltipData<D, M extends State>({
  processedData,
  paramKeys,
  groupingSelectOptions,
  model,
}: {
  processedData: IMetricsCollection<D>[];
  paramKeys: string[];
  groupingSelectOptions: IGroupingSelectOption[];
  model: IModel<M>;
}): ITooltipData {
  const data: ITooltipData = {};

  for (let metricsCollection of processedData) {
    const groupConfig = getGroupConfig({
      metricsCollection,
      groupingSelectOptions,
      model,
    });

    for (let metric of metricsCollection.data as any) {
      data[metric.key] = {
        runHash: metric.run.hash,
        metricName: metric.name,
        metricContext: metric.context,
        groupConfig,
        params: paramKeys.reduce((acc, paramKey) => {
          Object.assign(acc, {
            [paramKey]: _.get(metric, `run.params.${paramKey}`),
          });
          return acc;
        }, {}),
      };
    }
  }

  return data;
}
