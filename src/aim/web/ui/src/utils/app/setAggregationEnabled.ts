import { IModel, State } from 'types/services/models/model';

import isGroupingApplied from './isGroupingApplied';

export default function setAggregationEnabled<M extends State>({
  model,
  appName,
}: {
  model: IModel<M>;
  appName: string;
}): void {
  const configData = model.getState().config;
  const isAppliedGrouping = isGroupingApplied<Partial<M>>(model);
  if (configData) {
    configData.chart.aggregationConfig.isEnabled = isAppliedGrouping;
    if (!isAppliedGrouping) {
      configData.chart.aggregationConfig.isApplied = false;
    }
  }
}
