import * as analytics from 'services/analytics';
import { isNil } from 'lodash-es';
import { IChartZoom } from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';

export default function onZoomChange<M extends State>(
  zoom: Partial<IChartZoom>,
  model: IModel<M>,
  appName: string,
): void {
  const configData = model.getState()?.config;
  if (configData?.chart) {
    model.setState({
      config: {
        ...configData,
        chart: {
          ...configData.chart,
          zoom: {
            ...configData.chart.zoom,
            ...zoom,
          },
        },
      },
    });
  }
  if (!isNil(zoom.mode)) {
    analytics.trackEvent(
      `[${appName}Explorer][Chart] Set zoom mode to "${
        zoom.mode === 0 ? 'single' : 'multiple'
      }"`,
    );
  }
}
