import _ from 'lodash-es';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

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
      `${
        // @ts-ignore
        ANALYTICS_EVENT_KEYS[appName].chart.controls.changeAggregationMethod
      } area to "${AggregationAreaMethods[
        aggregationConfig.methods.area
      ].toLowerCase()}"`,
    );
    analytics.trackEvent(
      `${
        // @ts-ignore
        ANALYTICS_EVENT_KEYS[appName].chart.controls.changeAggregationMethod
      } line to "${AggregationAreaMethods[
        aggregationConfig.methods.line
      ].toLowerCase()}"`,
    );
  } else {
    analytics.trackEvent(
      `${
        // @ts-ignore
        ANALYTICS_EVENT_KEYS[appName].chart.controls.changeAggregation
      } to ${aggregationConfig.isApplied ? 'Enable' : 'Disable'}`,
    );
  }
}
