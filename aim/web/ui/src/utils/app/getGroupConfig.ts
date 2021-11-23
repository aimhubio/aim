import _ from 'lodash-es';

import {
  GroupNameType,
  IGroupingSelectOption,
  IMetricsCollection,
} from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';

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
  console.log('groupingSelectOptions', groupingSelectOptions);
  const configData = model.getState()?.config;
  debugger;
  console.log('configData', configData);
  let groupConfig: { [key: string]: {} } = {};

  for (let groupItemKey of groupingItems) {
    const groupItem: string[] = configData?.grouping?.[groupItemKey] || [];
    if (groupItem.length) {
      groupConfig[groupItemKey] = groupItem.reduce((acc, paramKey) => {
        Object.assign(acc, {
          [getValueByField(groupingSelectOptions || [], paramKey)]: _.get(
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
