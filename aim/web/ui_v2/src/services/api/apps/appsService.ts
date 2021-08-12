import API from '../api';

import { IAppData } from 'types/services/models/metrics/metricsAppModel';

const endpoints = {
  CREATE_APP: 'apps',
};
function createApp(reqBody: IAppData) {
  return API.post(endpoints.CREATE_APP, reqBody);
}

const appsService = {
  endpoints,
  createApp,
};

export default appsService;
