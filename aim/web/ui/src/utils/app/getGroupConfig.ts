import {
  GroupNameType,
  IGroupingSelectOption,
  IMetricsCollection,
} from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';

import { getValue } from 'utils/helper';

import getValueByField from '../getValueByField';

export default function getGroupConfig<D, M extends State>({
  collection,
  groupingSelectOptions,
  groupingItems = [],
  model,
}: {
  collection: IMetricsCollection<D>;
  groupingSelectOptions: IGroupingSelectOption[];
  groupingItems: GroupNameType[];
  model: IModel<M>;
}) {
  const configData = model.getState()?.config;
  let groupConfig: { [key: string]: {} } = {};

  for (let groupItemKey of groupingItems) {
    const groupItem: string[] = configData?.grouping?.[groupItemKey] || [];
    if (groupItem.length) {
      groupConfig[groupItemKey] = groupItem.reduce((acc, paramKey) => {
        Object.assign(acc, {
          [getValueByField(groupingSelectOptions || [], paramKey)]: getValue(
            collection.config,
            paramKey,
          ),
        });
        return acc;
      }, {});
    }
  }
  return groupConfig;
}
