import {
  IAppData,
  IDashboardRequestBody,
} from 'types/services/models/metrics/metricsAppModel';
import { IApiRequest } from 'types/services/services';

import API from '../api';

const endpoints = {
  DASHBOARD: 'dashboards',
};

function fetchDashboardsList(): IApiRequest<any> {
  return API.get(endpoints.DASHBOARD);
}

function fetchDashboard(id: string): IApiRequest<any> {
  return API.get(`${endpoints.DASHBOARD}/${id}`);
}

function createDashboard(
  reqBody: IDashboardRequestBody,
): IApiRequest<IAppData> {
  return API.post(endpoints.DASHBOARD, reqBody, {
    headers: { 'Content-type': 'application/json' },
  });
}

function updateDashboard(
  id: string,
  reqBody: IDashboardRequestBody,
): IApiRequest<any> {
  return API.put(`${endpoints.DASHBOARD}/${id}`, reqBody);
}

function deleteDashboard(id: string): IApiRequest<any> {
  return API.delete(`${endpoints.DASHBOARD}/${id}`);
}

const dashboardService = {
  endpoints,
  createDashboard,
  fetchDashboardsList,
  fetchDashboard,
  updateDashboard,
  deleteDashboard,
};

export default dashboardService;
