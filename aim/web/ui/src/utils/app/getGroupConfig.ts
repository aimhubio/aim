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
  groupingNames = [],
  configData,
}: {
  collection: IMetricsCollection<D>;
  groupingSelectOptions: IGroupingSelectOption[];
  groupingNames: GroupNameEnum[];
  configData: IAppModelConfig;
}) {
  let groupConfig: Record<string, {}> = {};

  for (let groupName of groupingNames) {
    const groupItem: string[] = configData?.grouping?.[groupName] || [];
    if (groupItem.length) {
      groupConfig[groupName] = groupItem.reduce((acc, paramKey) => {
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
