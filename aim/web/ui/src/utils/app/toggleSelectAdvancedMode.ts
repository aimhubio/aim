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
  const modelState: IModel<M> | any = model.getState();
  console.log(modelState);
  if (modelState.config?.select) {
    let query =
      modelState.config.select.advancedQuery ||
      getQueryStringFromSelect(
        modelState.config?.select,
        modelState.selectFormData.error,
      );
    if (query === '()') {
      query = '';
    }
    const newConfig = {
      ...modelState.config,
      select: {
        ...modelState.config.select,
        advancedQuery: query,
        advancedMode: !modelState.config.select.advancedMode,
      },
    };

    model.setState({ config: newConfig });
  }
  analytics.trackEvent(
    // @ts-ignore
    `${ANALYTICS_EVENT_KEYS[appName].useAdvancedSearch} ${
      !modelState.config?.select.advancedMode ? 'on' : 'off'
    }`,
  );
}
