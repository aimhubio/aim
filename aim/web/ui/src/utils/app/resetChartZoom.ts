import * as analytics from 'services/analytics';

import { IMetricAppConfig } from 'types/services/models/metrics/metricsAppModel';

export default function resetChartZoom({
  configData,
  appName,
}: {
  configData: IMetricAppConfig | any;
  appName: string;
}): IMetricAppConfig | any {
  configData.chart = {
    ...configData.chart,
    zoom: {
      ...configData.chart.zoom,
      active: false,
      history: [],
    },
  };
  analytics.trackEvent(`[${appName}Explorer][Chart] Reset zoom`);
  return configData;
}
