import * as analytics from 'services/analytics';

import { IOnSmoothingChange } from 'types/pages/metrics/Metrics';
import { CurveEnum } from 'utils/d3';

export default function onSmoothingChange(props: IOnSmoothingChange): void {
  const configData = props.model?.getState()?.config;
  if (configData?.chart) {
    configData.chart = { ...configData.chart, ...props };
    // updateModelData(configData);
  }
  if (props.curveInterpolation) {
    analytics.trackEvent(
      `[${props.appName}Explorer][Chart] Set interpolation mode to "${
        props.curveInterpolation === CurveEnum.Linear ? 'linear' : 'cubic'
      }"`,
    );
  } else {
    analytics.trackEvent(
      `[${props.appName}Explorer][Chart] Set smoothening algorithm to "${configData?.chart.smoothingAlgorithm}"`,
      { smoothingFactor: props.smoothingFactor },
    );
  }
}
