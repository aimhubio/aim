import { AlignmentOptions } from 'config/alignment/alignmentOptions';
import { IModel, State } from 'types/services/models/model';
import * as analytics from 'services/analytics';

export default function onAlignmentTypeChange<M extends State>(
  type: AlignmentOptions,
  model: IModel<M>,
  appName: string,
): void {
  const configData = model.getState()?.config;
  if (configData?.chart) {
    const alignmentConfig = { ...configData.chart.alignmentConfig, type };

    if (type !== AlignmentOptions.CUSTOM_METRIC) {
      alignmentConfig.metric = '';
    }
    configData.chart = {
      ...configData.chart,
      alignmentConfig,
    };
    // updateModelData(configData);
  }
  analytics.trackEvent(
    `[${appName}Explorer][Chart] Align X axis by "${AlignmentOptions[
      type
    ].toLowerCase()}"`,
  );
}
