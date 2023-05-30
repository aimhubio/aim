import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

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
  const { config, selectFormData } = model.getState();
  if (config) {
    let query =
      config.select.advancedQuery ||
      getQueryStringFromSelect(config?.select, selectFormData.error);
    if (query === '()') {
      query = '';
    }
    const newConfig = {
      ...config,
      select: {
        ...config.select,
        advancedQuery: query,
        advancedMode: !config.select.advancedMode,
      },
    };

    model.setState({ config: newConfig });
  }
  analytics.trackEvent(
    // @ts-ignore
    `${ANALYTICS_EVENT_KEYS[appName].useAdvancedSearch} ${
      !config?.select.advancedMode ? 'on' : 'off'
    }`,
  );
}
