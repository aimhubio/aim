import { getAPIHost } from 'config/config';

import ENDPOINTS from 'services/api/endpoints';
import NetworkService from 'services/NetworkService';

import {
  GetProjectsInfoQueryOptions,
  GetProjectsInfoResult,
  GetProjectContributionsResult,
  PackagesListType,
} from './types.d';

const api = new NetworkService(`${getAPIHost()}${ENDPOINTS.PROJECTS.BASE}`);

/**
 * function getProjectContributions
 * this call is used from DashboardPage page to show project contributions data
 */
async function getProjectContributions(): Promise<GetProjectContributionsResult> {
  return (await api.makeAPIGetRequest(ENDPOINTS.PROJECTS.GET_ACTIVITY)).body;
}

/**
 * function fetchPackages - get project packages
 * This call is used to fetch project packages data
 */
async function fetchPackages(namesOnly = false): Promise<PackagesListType> {
  return (
    await api.makeAPIGetRequest(
      `${ENDPOINTS.PROJECTS.GET_PACKAGES}?names_only=${namesOnly}`,
    )
  ).body;
}

async function getProjectsInfo(
  queryParams: GetProjectsInfoQueryOptions,
): Promise<GetProjectsInfoResult> {
  return (
    await api.makeAPIGetRequest(ENDPOINTS.PROJECTS.GET_INFO, {
      query_params: queryParams,
    })
  ).body;
}

export { getProjectsInfo, getProjectContributions, fetchPackages };
export * from './types.d';
