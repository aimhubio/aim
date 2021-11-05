import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

/**
 *
 * @param  {IModel<M extends State>} model - instance of createModel
 */

export default function onIgnoreOutliersChange<M extends State>({
  model,
  updateModelData,
}: {
  model: IModel<M>;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
}): void {
  const configData = model.getState()?.config;
  if (configData?.chart) {
    configData.chart.ignoreOutliers = !configData?.chart.ignoreOutliers;
    updateModelData(configData, true);
    model.setState({ config: configData });
  }
  analytics.trackEvent(
    `[MetricsExplorer][Chart] ${
      !configData?.chart.ignoreOutliers ? 'Ignore' : 'Display'
    } outliers`,
  );
}
