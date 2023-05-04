import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';
import { LegendsConfig } from 'types/services/models/metrics/metricsAppModel';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

/**
 * onLegendsChange - handler for legends config change
 *
 * @param  {IModel<M extends State>} model - instance of createModel
 * @param  {LegendsConfig} legends - legends config
 * @param  {string} appName - name of the app model
 */

export default function onLegendsChange<M extends State>({
  model,
  legends,
  updateModelData,
  appName,
}: {
  model: IModel<M>;
  legends: Partial<LegendsConfig>;
  appName: string;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
}): void {
  const configData = model.getState()?.config;
  if (configData?.chart) {
    configData.chart = {
      ...configData.chart,
      legends: {
        ...configData.chart.legends,
        ...legends,
      },
    };
    updateModelData(configData, true);
    model.setState({ config: configData });
  }
  if (legends?.mode) {
    analytics.trackEvent(
      // @ts-ignore
      `${ANALYTICS_EVENT_KEYS[appName].chart.controls.legends.mode} to ${configData?.chart.legends.mode}`,
    );
  }

  if (legends?.display) {
    analytics.trackEvent(
      // @ts-ignore
      `${ANALYTICS_EVENT_KEYS[appName].chart.controls.legends.display} to ${
        configData?.chart.legends.display ? 'visible' : 'hidden'
      }`,
    );
  }
}
