import _ from 'lodash';

import appsService from 'services/api/apps/appsService';

import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';
import { IModel, State } from 'types/services/models/model';
import { IAppData } from 'types/services/models/metrics/metricsAppModel';

import getStateFromUrl from '../getStateFromUrl';

import { getCompatibleSelectConfig } from './getCompatibleSelectConfig';

export default function getAppConfigData<M extends State>({
  appId,
  appRequest,
  config,
  model,
}: {
  appId: string;
  appRequest: {
    call: () => Promise<IAppData>;
    abort: () => void;
  };
  config: IAppModelConfig;
  model: IModel<M>;
}): {
  call: () => Promise<void>;
  abort: () => void;
} {
  if (appRequest) {
    appRequest.abort();
  }
  appRequest = appsService.fetchApp(appId);
  return {
    call: async () => {
      const appData = await appRequest.call();
      const configData = _.merge(config, appData.state);
      model.setState({ config: configData });
    },
    abort: appRequest.abort,
  };
}
