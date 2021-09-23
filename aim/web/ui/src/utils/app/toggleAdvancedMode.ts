import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';

export default function toggleSelectAdvancedMode<T extends State>(
  model: IModel<T>,
  appName: string,
) {
  const configData = model.getState()?.config;
  if (configData?.select) {
    model.setState({
      config: {
        ...configData,
        select: {
          ...configData.select,
          advancedMode: !configData.select.advancedMode,
        },
      },
    });
  }
  analytics.trackEvent(
    `[${appName}Explorer] Turn ${
      !configData?.select.advancedMode ? 'on' : 'off'
    } the advanced mode of select form`,
  );
}
