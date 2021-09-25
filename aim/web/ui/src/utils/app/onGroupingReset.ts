import * as analytics from 'services/analytics';

import { GroupNameType } from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';

export default function onGroupingReset<M extends State>(
  groupName: GroupNameType,
  model: IModel<M>,
  appName: string,
) {
  const configData = model.getState()?.config;
  if (configData?.grouping) {
    const { reverseMode, paletteIndex, isApplied, persistence } =
      configData.grouping;
    configData.grouping = {
      ...configData.grouping,
      reverseMode: { ...reverseMode, [groupName]: false },
      [groupName]: [],
      paletteIndex: groupName === 'color' ? 0 : paletteIndex,
      persistence: { ...persistence, [groupName]: false },
      isApplied: { ...isApplied, [groupName]: true },
    };
    // setAggregationEnabled(configData);
    // updateModelData(configData);
  }
  analytics.trackEvent(`[${appName}Explorer] Reset grouping`);
}
