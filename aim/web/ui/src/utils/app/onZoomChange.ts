import * as analytics from 'services/analytics';
import _ from 'lodash-es';
import { IChartZoom } from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';

export default function onZoomChange<M extends State>(
  zoom: Partial<IChartZoom>,
  model: IModel<M>,
  appName: string,
  updateURL: any,
): void {
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
    updateURL(configData);
  }
  if (!_.isNil(zoom.mode)) {
    analytics.trackEvent(
      `[${appName}][Chart] Set zoom mode to "${
        zoom.mode === 0 ? 'single' : 'multiple'
      }"`,
    );
  }
}
