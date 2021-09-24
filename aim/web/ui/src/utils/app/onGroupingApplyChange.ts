import { GroupNameType } from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';

export default function onGroupingApplyChange<M extends State>(
  groupName: GroupNameType,
  model: IModel<M>,
): void {
  const configData = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = {
      ...configData.grouping,
      isApplied: {
        ...configData.grouping.isApplied,
        [groupName]: !configData.grouping.isApplied[groupName],
      },
    };
    // setAggregationEnabled(configData);
    // updateModelData(configData);
  }
}
