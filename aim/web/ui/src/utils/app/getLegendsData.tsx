import { GroupNameEnum } from 'config/grouping/GroupingPopovers';

import {
  IGroupingSelectOption,
  IMetricsCollection,
  LegendsDataType,
} from 'types/services/models/metrics/metricsAppModel';
import { IGroupingConfig } from 'types/services/models/explorer/createAppModel';

import getValueByField from '../getValueByField';
import { encode } from '../encoder/encoder';

const groupingPropKeys: Record<
  GroupNameEnum,
  keyof IMetricsCollection<unknown>
> = {
  [GroupNameEnum.COLOR]: 'color',
  [GroupNameEnum.STROKE]: 'dasharray',
  [GroupNameEnum.CHART]: 'chartIndex',
  [GroupNameEnum.ROW]: 'key',
};

function getLegendsData(
  processedData: IMetricsCollection<unknown>[] = [],
  groupingSelectOptions: IGroupingSelectOption[] = [],
  groupingConfig: IGroupingConfig = {},
  groupingNames: GroupNameEnum[] = [],
): LegendsDataType {
  const legendsData: LegendsDataType = {};

  for (let groupName of groupingNames) {
    const legendDataByGroup: Record<string, any> = {};
    const groupPropKey = groupingPropKeys[groupName];
    const groupedItemPropKeys = groupingConfig[groupName] || [];

    if (groupedItemPropKeys.length > 0) {
      for (const item of processedData) {
        const legend = {
          [groupPropKey]: item[groupPropKey],
          config: groupedItemPropKeys.reduce(
            (acc: Record<string, any>, propKey) => {
              const key = getValueByField(groupingSelectOptions, propKey);
              acc[key] = item.config?.[propKey] || 'None';
              return acc;
            },
            {},
          ),
        };
        const hashed = encode(legend);
        if (!legendDataByGroup[hashed]) {
          legend.key = hashed;
          legendDataByGroup[hashed] = legend;
        }
      }

      legendsData[groupName] = {
        keys: groupedItemPropKeys.map((item) =>
          getValueByField(groupingSelectOptions, item),
        ),
        rows: Object.values(legendDataByGroup),
      };
    }
  }
  return legendsData;
}

export default getLegendsData;
