import _ from 'lodash-es';

import * as analytics from 'services/analytics';

import { IAggregationConfig } from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

import { AggregationAreaMethods } from 'utils/aggregateGroupData';

export default function onAggregationConfigChange<M extends State>({
  aggregationConfig,
  model,
  appName,
  updateModelData,
}: {
  aggregationConfig: Partial<IAggregationConfig>;
  model: IModel<M>;
  appName: string;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
}): void {
  const configData = model.getState()?.config;
  if (configData?.chart && !_.isEmpty(aggregationConfig)) {
    configData.chart = {
      ...configData.chart,
      aggregationConfig: {
        ...configData.chart.aggregationConfig,
        ...aggregationConfig,
      },
    };
    updateModelData(configData, true);
  }
  if (aggregationConfig.methods) {
    analytics.trackEvent(
      `[${appName}Explorer][Chart] Set aggregation area to "${AggregationAreaMethods[
        aggregationConfig.methods.area
      ].toLowerCase()}"`,
    );
    analytics.trackEvent(
      `[${appName}Explorer][Chart] Set aggregation line to "${AggregationAreaMethods[
        aggregationConfig.methods.line
      ].toLowerCase()}"`,
    );
  } else {
    analytics.trackEvent(
      `[${appName}Explorer][Chart] ${
        aggregationConfig.isApplied
          ? 'Aggregate metrics'
          : 'Deaggregate metrics'
      }`,
    );
  }
}
