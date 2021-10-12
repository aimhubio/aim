import * as analytics from 'services/analytics';
import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';
import { IModel, State } from 'types/services/models/model';

export default function onHighlightModeChange<M extends State>(
  mode: HighlightEnum,
  model: IModel<M>,
  appName: string,
  updateURL: any,
): void {
  const config = model.getState()?.config;
  if (config?.chart) {
    const configData = {
      ...config,
      chart: {
        ...config.chart,
        highlightMode: mode,
      },
    };
    model.setState({ config: configData });
    updateURL(configData);
  }
  analytics.trackEvent(
    `[${appName}][Chart] Set highlight mode to "${HighlightEnum[
      mode
    ].toLowerCase()}"`,
  );
}
