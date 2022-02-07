import _ from 'lodash';

import appsService from 'services/api/apps/appsService';

import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';
import { IModel, State } from 'types/services/models/model';
import { IAppData } from 'types/services/models/metrics/metricsAppModel';
import { IApiRequest } from 'types/services/services';

import { getCompatibleSelectConfig } from './getCompatibleSelectConfig';
import exceptionHandler from './exceptionHandler';

export default function getAppConfigData<M extends State>({
  appId,
  appRequest,
  config,
  model,
}: {
  appId: string;
  appRequest: IApiRequest<IAppData>;
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
      const appData = await appRequest.call((detail: any) => {
        exceptionHandler({ detail, model });
      });
      let select = appData?.state?.select;
      if (select) {
        const compatibleSelectConfig = getCompatibleSelectConfig(
          ['metrics', 'params', 'images'],
          select,
        );
        appData.state = {
          ...appData.state,
          select: {
            ...compatibleSelectConfig,
          },
        };
      }
      const configData = _.merge(config, appData.state);
      model.setState({ config: configData });
    },
    abort: appRequest.abort,
  };
}
