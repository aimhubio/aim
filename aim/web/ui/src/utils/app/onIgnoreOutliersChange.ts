import * as analytics from 'services/analytics';
import { IModel, State } from 'types/services/models/model';

/**
 *
 * @param  {IModel<M extends State>} model - instance of createModel
 */

export default function onIgnoreOutliersChange<M extends State>(
  model: IModel<M>,
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
