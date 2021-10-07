import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';
import { GroupNameType } from 'types/services/models/metrics/metricsAppModel';

export default function onGroupingPersistenceChange<M extends State>(
  groupName: GroupNameType,
  model: IModel<M>,
  appName: string,
): void {
  const configData = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = {
      ...configData.grouping,
      persistence: {
        ...configData.grouping.persistence,
        [groupName]: !configData.grouping.persistence[groupName],
      },
    };
    // setAggregationEnabled(configData);
    // updateModelData(configData);
  }
  analytics.trackEvent(
    `[${appName}Explorer] ${
      !configData?.grouping.persistence[groupName] ? 'Enable' : 'Disable'
    } ${groupName} persistence`,
  );
}
