import { AlignmentOptions } from 'config/alignment/alignmentOptions';
import { IModel, State } from 'types/services/models/model';
import * as analytics from 'services/analytics';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

export default function onAlignmentTypeChange<M extends State>({
  type,
  model,
  appName,
  updateModelData,
}: {
  type: AlignmentOptions;
  model: IModel<M>;
  appName: string;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
}): void {
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
    updateModelData(configData, true);
  }
  analytics.trackEvent(
    `[${appName}Explorer][Chart] Align X axis by "${AlignmentOptions[
      type
    ].toLowerCase()}"`,
  );
}
