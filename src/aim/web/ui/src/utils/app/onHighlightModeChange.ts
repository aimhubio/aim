import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';

import { HighlightEnum } from 'utils/d3';

import updateURL from './updateURL';

export default function onHighlightModeChange<M extends State>({
  mode,
  model,
  appName,
}: {
  mode: HighlightEnum;
  model: IModel<M>;
  appName: string;
}): void {
  const config = model.getState()?.config;
  if (config?.chart) {
    const configData = {
      ...config,
      chart: {
        ...config.chart,
        highlightMode: mode,
      },
    };
    model.setState({ config: configData });

    updateURL({ configData, appName });
  }
  analytics.trackEvent(
    `${
      // @ts-ignore
      ANALYTICS_EVENT_KEYS[appName].chart.controls.changeHighlightMode
    } to "${HighlightEnum[mode].toLowerCase()}"`,
  );
}
