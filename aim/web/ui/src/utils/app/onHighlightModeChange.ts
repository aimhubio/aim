import * as analytics from 'services/analytics';
import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';
import { IModel } from 'types/services/models/model';

export default function onHighlightModeChange(
  mode: HighlightEnum,
  model: IModel<any>,
  page: string,
): void {
  const configData = model.getState()?.config;
  if (configData?.chart) {
    model.setState({
      config: {
        ...configData,
        chart: {
          ...configData.chart,
          highlightMode: mode,
        },
      },
    });
  }
  analytics.trackEvent(
    `[${page}Explorer][Chart] Set highlight mode to "${HighlightEnum[
      mode
    ].toLowerCase()}"`,
  );
}
