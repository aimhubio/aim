import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';
import { CurveEnum } from 'utils/d3';

export default function onCurveInterpolationChange<M extends State>(
  model: IModel<M>,
  appName: string,
): void {
  const configData = model.getState()?.config;
  if (configData?.chart) {
    const chart = { ...configData.chart };
    chart.curveInterpolation =
      configData.chart.curveInterpolation === CurveEnum.Linear
        ? CurveEnum.MonotoneX
        : CurveEnum.Linear;
    // updateModelData({ ...configData, chart }, true);
    analytics.trackEvent(
      `[${appName}Explorer][Chart] Set interpolation mode to "${
        configData.chart.curveInterpolation === CurveEnum.Linear
          ? 'cubic'
          : 'linear'
      }"`,
    );
  }
}
