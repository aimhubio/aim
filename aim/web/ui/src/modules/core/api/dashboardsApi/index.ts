import { getAPIHost } from 'config/config';

import ENDPOINTS from 'services/api/endpoints';
import NetworkService from 'services/NetworkService';

import { IDashboardData, IDashboardRequestBody } from './types';

const api = new NetworkService(`${getAPIHost()}${ENDPOINTS.DASHBOARDS.BASE}`);

/**
 * function fetchDashboardsList
 * this call is used for fetching dashboards list.
 * @returns {Promise<IDashboardData[]>}
 */
async function fetchDashboardsList(): Promise<IDashboardData[]> {
  return (await api.makeAPIGetRequest(ENDPOINTS.DASHBOARDS.GET)).body;
}

/**
 * function fetchDashboard
 * this call is used for fetching a dashboard by id.
 * @param id - id of dashboard
 * @returns {Promise<IDashboardData>}
 */
async function fetchDashboard(id: string): Promise<IDashboardData[]> {
  return (await api.makeAPIGetRequest(`${ENDPOINTS.DASHBOARDS.GET}/${id}`))
    .body;
}

/**
 * function createDashboard
 * this call is used for creating new dashboard.
 * @param reqBody - query body params
 * @returns {Promise<IDashboardData>}
 */
async function createDashboard(
  reqBody: IDashboardRequestBody,
): Promise<IDashboardData> {
  return (
    await api.makeAPIPostRequest(ENDPOINTS.DASHBOARDS.CREATE, {
      body: reqBody,
    })
  ).body;
}

/**
 * function updateDashboard
 * this call is used for updating a dashboard by id.
 * @param id - id of dashboard
 * @param reqBody - query body params
 * @returns {Promise<IDashboardData>}
 */
async function updateDashboard(
  id: string,
  reqBody: IDashboardRequestBody,
): Promise<IDashboardData> {
  return (await api.makeAPIPutRequest(`/${id}`, { body: reqBody })).body;
}

/**
 * function deleteDashboard
 * this call is used for deleting a dashboard by id.
 * @param id - id of dashboard
 * @returns {Promise<IDashboardData>}
 */
async function deleteDashboard(id: string): Promise<any> {
  return api.makeAPIDeleteRequest(`/${id}`);
}

export {
  fetchDashboardsList,
  fetchDashboard,
  createDashboard,
  updateDashboard,
  deleteDashboard,
};
export * from './types';
