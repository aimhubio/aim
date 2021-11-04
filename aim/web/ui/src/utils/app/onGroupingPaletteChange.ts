import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

export default function onGroupingPaletteChange<M extends State>({
  index,
  model,
  appName,
  updateModelData,
  setAggregationEnabled,
}: {
  index: number;
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
      paletteIndex: index,
    };
    if (typeof setAggregationEnabled === 'function') {
      setAggregationEnabled({ model, appName });
    }
    updateModelData(configData, true);
  }
  analytics.trackEvent(
    `[${appName}Explorer] Set color palette to "${
      index === 0 ? '8 distinct colors' : '24 colors'
    }"`,
  );
}
