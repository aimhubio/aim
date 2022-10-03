import { getAPIHost } from 'config/config';

import ENDPOINTS from 'services/api/endpoints';
import NetworkService from 'services/NetworkService';

import {
  GetParamsQueryOptions,
  GetParamsResult,
  GetProjectContributionsResult,
} from './types';

const api = new NetworkService(`${getAPIHost()}${ENDPOINTS.PROJECTS.BASE}`);

/**
 * function getParams
 * this call is used for i.e. autosuggestions etc.
 * @param {GetParamsQueryOptions} queryParams
 */
async function getParams(
  queryParams: GetParamsQueryOptions,
): Promise<GetParamsResult> {
  return (
    await api.makeAPIGetRequest(ENDPOINTS.PROJECTS.GET_PARAMS, {
      query_params: queryParams,
    })
  ).body;
}

/**
 * function getProjectContributions
 * this call is used from DashboardPage page to show project contributions data
 */
async function getProjectContributions(): Promise<GetProjectContributionsResult> {
  return (await api.makeAPIGetRequest(ENDPOINTS.PROJECTS.GET_ACTIVITY)).body;
}

export { getParams, getProjectContributions };
export * from './types';
