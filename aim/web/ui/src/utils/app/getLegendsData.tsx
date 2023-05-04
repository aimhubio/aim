import {
  LegendColumnDataType,
  LegendsDataType,
} from 'components/VisualizationLegends';

import { GroupNameEnum } from 'config/grouping/GroupingPopovers';

import {
  IGroupingSelectOption,
  IMetricsCollection,
} from 'types/services/models/metrics/metricsAppModel';
import { IGroupingConfig } from 'types/services/models/explorer/createAppModel';

import getValueByField from '../getValueByField';
import { encode } from '../encoder/encoder';
import { formatValue } from '../formatValue';

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
    const legendRowData: Record<string, any> = {};
    const groupPropKey = groupingPropKeys[groupName];
    const groupedItemPropKeys = groupingConfig[groupName] || [];

    if (groupedItemPropKeys.length > 0) {
      for (const item of processedData) {
        const config: Record<string, string> = {};
        for (const propKey of groupedItemPropKeys) {
          const key = getValueByField(groupingSelectOptions, propKey);
          const value = item.config?.[propKey];
          config[key] = formatValue(value);
        }
        const legendRow = {
          [groupPropKey]: item[groupPropKey],
          config,
        };
        const hashed = encode(legendRow);
        if (!legendRowData[hashed]) {
          legendRowData[hashed] = legendRow;
        }
      }
      const keys = groupedItemPropKeys.map((item) =>
        getValueByField(groupingSelectOptions, item),
      );
      const uniqueRows = Object.values(legendRowData);
      const groupedByColumns: Record<string, LegendColumnDataType[]> = {};
      for (let key of keys) {
        groupedByColumns[key] = uniqueRows.map((row) => ({
          value: row.config[key],
          color: row.color,
          dasharray: row.dasharray,
          chartIndex: row.chartIndex,
        }));
      }

      legendsData[groupName] = groupedByColumns;
    }
  }
  return legendsData;
}

export default getLegendsData;
