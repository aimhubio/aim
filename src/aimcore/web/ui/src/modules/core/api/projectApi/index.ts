import { getAPIHost } from 'config/config';

import ENDPOINTS from 'services/api/endpoints';
import NetworkService from 'services/NetworkService';

import { SequenceTypeUnion } from '../../../../types/core/enums';

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
async function fetchPackages(includeTypes = true): Promise<PackagesListType> {
  return (
    await api.makeAPIGetRequest(
      `${ENDPOINTS.PROJECTS.GET_PACKAGES}?include_types=${includeTypes}`,
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
