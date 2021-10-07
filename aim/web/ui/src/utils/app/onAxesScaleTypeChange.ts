import * as analytics from 'services/analytics';

import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { IModel, State } from '../../types/services/models/model';

export default function onAxesScaleTypeChange<M extends State>(
  args: IAxesScaleState,
  model: IModel<M>,
  appName: string,
): void {
  const configData = model?.getState()?.config;
  if (configData?.chart) {
    configData.chart.axesScaleType = args;
    // updateModelData(configData);
  }
  analytics.trackEvent(
    `[${appName}Explorer][Chart] Set X axis scale type "${args.xAxis}"`,
  );
  analytics.trackEvent(
    `[${appName}Explorer][Chart] Set Y axis scale type "${args.yAxis}"`,
  );
}
