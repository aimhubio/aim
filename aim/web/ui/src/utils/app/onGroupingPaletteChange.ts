import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';
import setAggregationEnabled from './setAggregationEnabled';

export default function onGroupingPaletteChange<M extends State>(
  index: number,
  model: IModel<M>,
  appName: string,
  updateModelData: any,
  setAggregationEnabled?: any,
): void {
  const configData = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = {
      ...configData.grouping,
      paletteIndex: index,
    };
    if (typeof setAggregationEnabled === 'function') {
      setAggregationEnabled(model, appName);
    }
    updateModelData(configData);
  }
  analytics.trackEvent(
    `[${appName}Explorer] Set color palette to "${
      index === 0 ? '8 distinct colors' : '24 colors'
    }"`,
  );
}
