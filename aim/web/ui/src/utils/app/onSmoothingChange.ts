import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';

import { IOnSmoothingChange } from 'types/pages/metrics/Metrics';
import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

import { CurveEnum } from 'utils/d3';

export default function onSmoothingChange<M extends State>({
  args,
  model,
  appName,
  updateModelData,
}: {
  args: IOnSmoothingChange;
  model: IModel<M>;
  appName: string;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
}): void {
  const configData = model?.getState()?.config;
  if (configData?.chart) {
    configData.chart = { ...configData.chart, ...args };
    updateModelData(configData, true);
  }
  if (args.curveInterpolation) {
    analytics.trackEvent(
      `${
        // @ts-ignore
        ANALYTICS_EVENT_KEYS[appName].chart.controls
          .changeCurveInterpolationMode
      } to "${
        args.curveInterpolation === CurveEnum.Linear ? 'linear' : 'cubic'
      }"`,
    );
  } else {
    analytics.trackEvent(
      // @ts-ignore
      `${ANALYTICS_EVENT_KEYS[appName].chart.controls.selectSmoothingOptions} to "${configData?.chart.smoothingAlgorithm}"`,
      { smoothingFactor: args.smoothingFactor },
    );
  }
}
