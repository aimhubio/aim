import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';
import resetChartZoom from './resetChartZoom';
import { IOnGroupingSelectChangeParams } from '../../types/services/models/metrics/metricsAppModel';

export default function onGroupingSelectChange<M extends State>(
  { groupName, list }: IOnGroupingSelectChangeParams,
  model: IModel<M>,
  appName: string,
  updateModelData: any,
  setAggregationEnabled?: any,
) {
  let configData = model.getState()?.config;
  if (configData) {
    configData.grouping = { ...configData.grouping, [groupName]: list };
    configData = resetChartZoom(configData, appName);
    if (typeof setAggregationEnabled === 'function') {
      setAggregationEnabled(model, appName);
    }
    updateModelData(configData);
  }
  analytics.trackEvent(`[MetricsExplorer] Group by ${groupName}`);
}
