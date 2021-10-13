import * as analytics from 'services/analytics';

import { IOnGroupingModeChangeParams } from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';
import resetChartZoom from './resetChartZoom';

export default function onGroupingModeChange<M extends State>(
  { groupName, value }: IOnGroupingModeChangeParams,
  model: IModel<M>,
  appName: string,
  updateModelData: any,
  setAggregationEnabled?: any,
): void {
  const configData = model?.getState()?.config;
  if (configData?.grouping) {
    configData.grouping.reverseMode = {
      ...configData.grouping.reverseMode,
      [groupName]: value,
    };
    if (groupName === 'chart') {
      resetChartZoom(configData, appName);
    }
    if (typeof setAggregationEnabled === 'function') {
      setAggregationEnabled(model, appName);
    }
    updateModelData(configData);
  }
  analytics.trackEvent(
    `[MetricsExplorer] ${
      value ? 'Disable' : 'Enable'
    } grouping by ${groupName} reverse mode`,
  );
}
