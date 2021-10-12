import * as analytics from 'services/analytics';

import { IOnSmoothingChange } from 'types/pages/metrics/Metrics';
import { CurveEnum } from 'utils/d3';
import { IModel, State } from 'types/services/models/model';

export default function onSmoothingChange<M extends State>(
  args: IOnSmoothingChange,
  model: IModel<M>,
  appName: string,
  updateModelData: any,
): void {
  const configData = model?.getState()?.config;
  if (configData?.chart) {
    configData.chart = { ...configData.chart, ...args };
    updateModelData(configData);
  }
  if (args.curveInterpolation) {
    analytics.trackEvent(
      `[${appName}Explorer][Chart] Set interpolation mode to "${
        args.curveInterpolation === CurveEnum.Linear ? 'linear' : 'cubic'
      }"`,
    );
  } else {
    analytics.trackEvent(
      `[${appName}Explorer][Chart] Set smoothening algorithm to "${configData?.chart.smoothingAlgorithm}"`,
      { smoothingFactor: args.smoothingFactor },
    );
  }
}
