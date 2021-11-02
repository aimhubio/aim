import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';
import { GroupNameType } from 'types/services/models/metrics/metricsAppModel';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

import resetChartZoom from './resetChartZoom';

export default function onGroupingModeChange<M extends State>({
  groupName,
  value,
  model,
  appName,
  updateModelData,
  setAggregationEnabled,
}: {
  groupName: GroupNameType;
  value: boolean;
  model: IModel<M>;
  appName: string;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
  setAggregationEnabled?: any;
}): void {
  const configData = model?.getState()?.config;
  if (configData?.grouping) {
    configData.grouping.reverseMode = {
      ...configData.grouping.reverseMode,
      [groupName]: value,
    };
    if (groupName === 'chart') {
      resetChartZoom({ configData, appName });
    }
    if (typeof setAggregationEnabled === 'function') {
      setAggregationEnabled({ model, appName });
    }
    updateModelData(configData, true);
  }
  analytics.trackEvent(
    `[MetricsExplorer] ${
      value ? 'Disable' : 'Enable'
    } grouping by ${groupName} reverse mode`,
  );
}
