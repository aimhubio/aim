import * as analytics from 'services/analytics';

import { IOnSmoothingChange } from 'types/pages/metrics/Metrics';
import { CurveEnum } from 'utils/d3';
import { SmoothingAlgorithmEnum } from '../smoothingData';
import { IModel } from '../../types/services/models/model';

export default function onSmoothingChange(
  args: IOnSmoothingChange,
  model?: IModel<any>,
  appName?: string,
): void {
  const configData = model?.getState()?.config;
  if (configData?.chart) {
    configData.chart = { ...configData.chart, ...args };
    // updateModelData(configData);
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
