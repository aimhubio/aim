import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';

import getQueryStringFromSelect from './getQueryStringFromSelect';

export default function toggleSelectAdvancedMode<M extends State>({
  model,
  appName,
}: {
  model: IModel<M>;
  appName: string;
}): void {
  const configData = model.getState()?.config;
  if (configData?.select) {
    let query =
      configData.select.advancedQuery ||
      getQueryStringFromSelect(configData?.select);
    if (query === '()') {
      query = '';
    }
    const newConfig = {
      ...configData,
      select: {
        ...configData.select,
        advancedQuery: query,
        advancedMode: !configData.select.advancedMode,
      },
    };

    model.setState({ config: newConfig });
  }
  analytics.trackEvent(
    `[${appName}Explorer] Turn ${
      !configData?.select.advancedMode ? 'on' : 'off'
    } the advanced mode of select form`,
  );
}
