import { IModel, State } from 'types/services/models/model';
import { ITrendlineOptions } from 'types/services/models/scatter/scatterAppModel';

import updateURL from './updateURL';

export default function onChangeTrendlineOptions<M extends State>({
  trendlineOptions,
  model,
  appName,
}: {
  trendlineOptions: Partial<ITrendlineOptions>;
  model: IModel<M>;
  appName: string;
}): void {
  let configData = model.getState()?.config;
  if (configData?.chart) {
    configData = {
      ...configData,
      chart: {
        ...configData.chart,
        trendlineOptions: {
          ...configData.chart.trendlineOptions,
          ...trendlineOptions,
        },
      },
    };

    model.setState({ config: configData });
    updateURL({ configData, appName });
  }

  // TODO: add analytics track event
  // analytics.trackEvent(`[${appName}Explorer] Change trendline options`);
}
