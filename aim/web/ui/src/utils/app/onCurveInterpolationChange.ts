import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

import { CurveEnum } from 'utils/d3';

export default function onCurveInterpolationChange<M extends State>({
  model,
  appName,
  updateModelData,
}: {
  model: IModel<M>;
  appName: string;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
}): void {
  const configData = model.getState()?.config;
  if (configData?.chart) {
    const chart = { ...configData.chart };
    chart.curveInterpolation =
      configData.chart.curveInterpolation === CurveEnum.Linear
        ? CurveEnum.MonotoneX
        : CurveEnum.Linear;

    updateModelData({ ...configData, chart }, true);

    analytics.trackEvent(
      `${
        // @ts-ignore
        ANALYTICS_EVENT_KEYS[appName].chart.controls
          .changeCurveInterpolationMode
      } to "${
        configData.chart.curveInterpolation === CurveEnum.Linear
          ? 'cubic'
          : 'linear'
      }"`,
    );
  }
}
