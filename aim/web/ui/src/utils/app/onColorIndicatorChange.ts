import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

export default function onColorIndicatorChange<M extends State>({
  model,
  appName,
  updateModelData,
}: {
  model: IModel<M>;
  appName: string;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
}): void {
  const configData = model.getState()?.config;
  if (configData?.chart) {
    const chart = { ...configData.chart };
    chart.isVisibleColorIndicator = !configData.chart.isVisibleColorIndicator;
    updateModelData({ ...configData, chart }, true);
    analytics.trackEvent(
      `${
        // @ts-ignore
        ANALYTICS_EVENT_KEYS[appName].chart.controls.changeColorIndicatorMode
      } to ${
        configData.chart.isVisibleColorIndicator ? 'Disable' : 'Enable'
      } color indicator`,
    );
  }
}
