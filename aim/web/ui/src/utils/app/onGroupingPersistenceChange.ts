import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';
import { GroupNameType } from 'types/services/models/metrics/metricsAppModel';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

export default function onGroupingPersistenceChange<M extends State>({
  groupName,
  model,
  appName,
  updateModelData,
  setAggregationEnabled,
}: {
  groupName: GroupNameType;
  model: IModel<M>;
  appName: string;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
  setAggregationEnabled?: any;
}): void {
  const configData = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = {
      ...configData.grouping,
      persistence: {
        ...configData.grouping.persistence,
        [groupName]: !configData.grouping.persistence[groupName],
      },
    };
    if (typeof setAggregationEnabled === 'function') {
      setAggregationEnabled({ model, appName });
    }
    updateModelData(configData, true);
  }
  analytics.trackEvent(
    `[${appName}Explorer] ${
      !configData?.grouping.persistence[groupName] ? 'Enable' : 'Disable'
    } ${groupName} persistence`,
  );
}
