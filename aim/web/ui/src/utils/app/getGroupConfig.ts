import { GroupNameEnum } from 'config/grouping/GroupingPopovers';

import {
  IGroupingSelectOption,
  IMetricsCollection,
} from 'types/services/models/metrics/metricsAppModel';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

import { getValue } from 'utils/helper';

import getValueByField from '../getValueByField';

export default function getGroupConfig<D>({
  collection,
  groupingSelectOptions,
  groupingItems = [],
  configData,
}: {
  collection: IMetricsCollection<D>;
  groupingSelectOptions: IGroupingSelectOption[];
  groupingItems: GroupNameEnum[];
  configData: IAppModelConfig;
}) {
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
