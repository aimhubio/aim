import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';

export default function toggleSelectAdvancedMode<M extends State>(
  model: IModel<M>,
  appName: string,
  updateURL: any,
): void {
  const configData = model.getState()?.config;
  if (configData?.select) {
    const newConfig = {
      ...configData,
      select: {
        ...configData.select,
        advancedMode: !configData.select.advancedMode,
      },
    };

    updateURL(newConfig);

    model.setState({ config: newConfig });
  }
  analytics.trackEvent(
    `[${appName}Explorer] Turn ${
      !configData?.select.advancedMode ? 'on' : 'off'
    } the advanced mode of select form`,
  );
}
