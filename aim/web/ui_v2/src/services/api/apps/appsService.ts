import API from '../api';

import { IAppData } from 'types/services/models/metrics/metricsAppModel';
import { IApiRequest } from 'types/services/services';

const endpoints = {
  APPS: 'apps',
};

function fetchAppsList(): IApiRequest<IAppData[]> {
  return API.get(endpoints.APPS);
}

function fetchApp(id: string): IApiRequest<IAppData> {
  return API.get(`${endpoints.APPS}/${id}`);
}

function createApp(reqBody: IAppData): IApiRequest<IAppData> {
  return API.post(endpoints.APPS, reqBody);
}

function updateApp(id: string, reqBody: IAppData): IApiRequest<IAppData> {
  return API.put(`${endpoints.APPS}/${id}`, reqBody);
}

function deleteApp(id: string): IApiRequest<any> {
  return API.delete(`${endpoints.APPS}/${id}`);
}
const appsService = {
  endpoints,
  fetchAppsList,
  fetchApp,
  createApp,
  updateApp,
  deleteApp,
};

export default appsService;
