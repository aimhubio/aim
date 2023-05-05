import { IAxesScaleRange } from 'components/AxesPropsPopover';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';

import updateURL from './updateURL';

const onAxesScaleRangeChange = <M extends State>({
  range,
  model,
  appName,
}: {
  range: Partial<IAxesScaleRange>;
  model: IModel<M>;
  appName: string;
}): void => {
  let configData = model?.getState()?.config;
  if (configData?.chart) {
    configData = {
      ...configData,
      chart: {
        ...configData.chart,
        axesScaleRange: {
          ...configData.chart.axesScaleRange,
          yAxis: {
            ...configData.chart.axesScaleRange.yAxis,
            ...(range.yAxis || {}),
          },
          xAxis: {
            ...configData.chart.axesScaleRange.xAxis,
            ...(range.xAxis || {}),
          },
        },
      },
    };
    model.setState({ config: configData });
    updateURL({ configData, appName });
  }
  analytics.trackEvent(
    // @ts-ignore
    `${ANALYTICS_EVENT_KEYS[appName].chart.controls.changeAxesScaleRange} to "${range.yAxis}"`,
  );
};

export default onAxesScaleRangeChange;
