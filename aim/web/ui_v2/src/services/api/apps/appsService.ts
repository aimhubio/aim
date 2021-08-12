import API from '../api';

import { IAppData } from 'types/services/models/metrics/metricsAppModel';

const endpoints = {
  CREATE_APP: 'apps',
  GET_APP: 'apps/',
};
function createApp(reqBody: IAppData) {
  return API.post(endpoints.CREATE_APP, reqBody);
}
function fetchApp(id: string): {
  call: () => Promise<IAppData>;
  abort: () => void;
} {
  return API.get(endpoints.GET_APP + id);
}

const appsService = {
  endpoints,
  createApp,
  fetchApp,
};

export default appsService;
