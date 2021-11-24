import _ from 'lodash-es';

import {
  GroupNameType,
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
  groupingItems = [],
  model,
}: {
  processedData: IMetricsCollection<D>[];
  paramKeys: string[];
  groupingSelectOptions: IGroupingSelectOption[];
  groupingItems: GroupNameType[];
  model: IModel<M>;
}): ITooltipData {
  const data: ITooltipData = {};

  for (let collection of processedData) {
    const groupConfig = getGroupConfig({
      collection,
      groupingSelectOptions,
      groupingItems,
      model,
    });

    for (let itemData of collection.data as any) {
      data[itemData.key] = {
        ...itemData,
        groupConfig,
        params: paramKeys.reduce((acc, paramKey) => {
          Object.assign(acc, {
            [paramKey]: _.get(itemData, `run.params.${paramKey}`),
          });
          return acc;
        }, {}),
      };
    }
  }

  return data;
}
