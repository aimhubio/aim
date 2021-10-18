import _ from 'lodash-es';
import {
  GroupNameType,
  IMetricsCollection,
} from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';

export default function getGroupConfig<M extends State>({
  metricsCollection,
  model,
}: {
  metricsCollection: IMetricsCollection<any>;
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
          [paramKey.replace('run.params.', '')]: JSON.stringify(
            _.get(metricsCollection.config, paramKey, '-'),
          ),
        });
        return acc;
      }, {});
    }
  }
  return groupConfig;
}
