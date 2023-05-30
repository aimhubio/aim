import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';
import { GroupNameEnum } from 'config/grouping/GroupingPopovers';

import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

export default function onGroupingPersistenceChange<M extends State>({
  groupName,
  model,
  appName,
  updateModelData,
  setAggregationEnabled,
}: {
  groupName: GroupNameEnum;
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
    `${
      // @ts-ignore
      ANALYTICS_EVENT_KEYS[appName].groupings[groupName].persistenceChange
    } to ${
      !configData?.grouping.persistence[groupName] ? 'Disable' : 'Enable'
    }`,
  );
}
