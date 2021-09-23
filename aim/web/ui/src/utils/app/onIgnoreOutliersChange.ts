import * as analytics from 'services/analytics';
import { IModel, State } from 'types/services/models/model';

/**
 *
 * @param  {IModel<T extends State>} model - instance of createModel
 */

export default function onIgnoreOutliersChange<T extends State>(
  model: IModel<T>,
): void {
  const configData = model.getState()?.config;
  if (configData?.chart) {
    configData.chart.ignoreOutliers = !configData?.chart.ignoreOutliers;
    // updateModelData(configData);
    model.setState({ config: configData });
  }
  analytics.trackEvent(
    `[MetricsExplorer][Chart] ${
      !configData?.chart.ignoreOutliers ? 'Ignore' : 'Display'
    } outliers`,
  );
}
