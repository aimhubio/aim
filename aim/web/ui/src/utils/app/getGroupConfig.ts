import _ from 'lodash-es';
import {
  GroupNameType,
  IGroupingSelectOption,
  IMetricsCollection,
} from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';
import getValueByField from '../getValueByField';

export default function getGroupConfig<D, M extends State>({
  metricsCollection,
  groupingSelectOptions,
  model,
}: {
  metricsCollection: IMetricsCollection<D>;
  groupingSelectOptions: IGroupingSelectOption[];
  model: IModel<M>;
}) {
  const groupingItems: GroupNameType[] = ['color', 'stroke', 'chart'];
  const configData = model.getState()?.config;
  let groupConfig: { [key: string]: {} } = {};

  for (let groupItemKey of groupingItems) {
    const groupItem: string[] = configData?.grouping?.[groupItemKey] || [];
    if (groupItem.length) {
      groupConfig[groupItemKey] = groupItem.reduce((acc, paramKey) => {
        Object.assign(acc, {
          [getValueByField(groupingSelectOptions || [], paramKey)]: _.get(
            metricsCollection.config,
            paramKey,
          ),
        });
        return acc;
      }, {});
    }
  }
  return groupConfig;
}
