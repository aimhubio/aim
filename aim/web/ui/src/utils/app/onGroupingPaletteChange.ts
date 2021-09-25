import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';

export default function onGroupingPaletteChange<M extends State>(
  index: number,
  model: IModel<M>,
  appName: string,
): void {
  const configData = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = {
      ...configData.grouping,
      paletteIndex: index,
    };
    // setAggregationEnabled(configData);
    // updateModelData(configData);
  }
  analytics.trackEvent(
    `[${appName}Explorer] Set color palette to "${
      index === 0 ? '8 distinct colors' : '24 colors'
    }"`,
  );
}
