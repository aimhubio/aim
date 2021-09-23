import * as analytics from 'services/analytics';
import { IMetricAppConfig } from 'types/services/models/metrics/metricsAppModel';

export default function resetChartZoom(
  configData: IMetricAppConfig | any,
  page: string,
): IMetricAppConfig | any {
  analytics.trackEvent(`[${page}Explorer][Chart] Reset zoom`);
  configData.chart = {
    ...configData.chart,
    zoom: {
      ...configData.chart.zoom,
      active: false,
      history: [],
    },
  };
  return configData;
}
