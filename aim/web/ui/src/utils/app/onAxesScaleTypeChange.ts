import * as analytics from 'services/analytics';

import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';

export default function onAxesScaleTypeChange(params: IAxesScaleState): void {
  const configData = params.model?.getState()?.config;
  if (configData?.chart) {
    configData.chart.axesScaleType = params;
    // updateModelData(configData);
  }
  analytics.trackEvent(
    `[${params.appName}Explorer][Chart] Set X axis scale type "${params.xAxis}"`,
  );
  analytics.trackEvent(
    `[${params.appName}Explorer][Chart] Set Y axis scale type "${params.yAxis}"`,
  );
}
