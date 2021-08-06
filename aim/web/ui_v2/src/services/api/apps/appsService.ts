import API from '../api';

import {
  IAppData,
  IAppRequestBody,
} from 'types/services/models/metrics/metricsAppModel';

const endpoints = {
  CREATE_APP: '/apps',
};
function createApp() {
  return {
    call: (reqBody: IAppRequestBody) => ({
      then: (resolve: (data: IAppData) => void, reject?: unknown) => {
        API.post(endpoints.CREATE_APP, reqBody)
          .call()
          .then((res: any) => {
            resolve(res);
          });
      },
    }),
    abort: () => null,
  };
}

const appsService = {
  endpoints,
  createApp,
};

export default appsService;
