import * as analytics from 'services/analytics';

import { State } from 'types/services/models/model';
import resetChartZoom from './resetChartZoom';

export default function onGroupingSelectChange<M extends State>({
  groupName,
  list,
  model,
}: any) {
  let configData = model.getState()?.config;
  if (configData) {
    configData.grouping = { ...configData.grouping, [groupName]: list };
    configData = resetChartZoom(configData, 'Metrics');
    // setAggregationEnabled(configData);
    // updateModelData(configData);
  }
  analytics.trackEvent(`[MetricsExplorer] Group by ${groupName}`);
}
