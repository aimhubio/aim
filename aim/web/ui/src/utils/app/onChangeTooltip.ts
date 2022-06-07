import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';

import {
  IPanelTooltip,
  ITooltipData,
} from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';

import filterTooltipContent from 'utils/filterTooltipContent';

import updateURL from './updateURL';

export default function onChangeTooltip<M extends State>({
  tooltip,
  tooltipData,
  model,
  appName,
}: {
  tooltip: Partial<IPanelTooltip>;
  tooltipData: ITooltipData;
  model: IModel<M>;
  appName: string;
}): void {
  let configData = model.getState()?.config;
  if (configData?.chart) {
    let content = configData.chart.tooltip.content;
    if (tooltip.selectedFields && configData?.chart.focusedState.key) {
      content = filterTooltipContent(
        tooltipData[configData.chart.focusedState.key],
        tooltip.selectedFields,
      );
    }
    configData = {
      ...configData,
      chart: {
        ...configData.chart,
        tooltip: {
          ...configData.chart.tooltip,
          ...tooltip,
          content,
        },
      },
    };

    model.setState({ config: configData });
    updateURL({ configData, appName });
  }
  analytics.trackEvent(
    // @ts-ignore
    ANALYTICS_EVENT_KEYS[appName].chart.controls.tooltip.changeTooltipContent,
  );
}
