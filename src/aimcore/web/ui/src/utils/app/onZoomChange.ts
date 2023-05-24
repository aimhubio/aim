import _ from 'lodash-es';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';

import { IChartZoom } from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';

import updateURL from './updateURL';

export default function onZoomChange<M extends State>({
  zoom,
  model,
  appName,
}: {
  zoom: Partial<IChartZoom>;
  model: IModel<M>;
  appName: string;
}): void {
  const config = model.getState()?.config;
  if (config?.chart) {
    const configData = {
      ...config,
      chart: {
        ...config.chart,
        zoom: {
          ...config.chart.zoom,
          ...zoom,
        },
      },
    };
    model.setState({ config: configData });

    updateURL({ configData, appName });
  }
  if (!_.isNil(zoom.mode)) {
    analytics.trackEvent(
      // @ts-ignore
      `${ANALYTICS_EVENT_KEYS[appName].chart.controls.changeZoomMode} to "${
        zoom.mode === 0 ? 'single' : 'multiple'
      }"`,
    );
  }
}
