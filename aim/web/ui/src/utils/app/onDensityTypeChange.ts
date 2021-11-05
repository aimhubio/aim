import { DensityOptions } from 'config/enums/densityEnum';

import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';

export default async function onDensityTypeChange<M extends State>({
  type,
  model,
  appName,
  getMetricsData,
}: {
  type: DensityOptions;
  model: IModel<M>;
  appName: string;
  getMetricsData: (shouldUrlUpdate?: boolean) => {
    call: () => Promise<void>;
    abort: () => void;
  };
}): Promise<void> {
  const modelState = model.getState();
  let configData = modelState?.config;
  if (configData?.chart) {
    configData = {
      ...configData,
      chart: {
        ...configData.chart,
        densityType: type,
      },
    };
    model.setState({ config: configData });
  }
  getMetricsData(true).call();
  analytics.trackEvent(
    `[${appName}Explorer][Chart] Set point density to "${DensityOptions[
      type
    ].toLowerCase()}"`,
  );
}
