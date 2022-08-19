import { getAPIHost } from 'config/config';

import ENDPOINTS from 'services/api/endpoints';
import NetworkService from 'services/NetworkService';

import {
  GetParamsQueryOptions,
  GetParamsResult,
  GetActivityResult,
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
 * function getActivity
 * this call is used from home page to show activity data
 */
async function getActivity(): Promise<GetActivityResult> {
  return (await api.makeAPIGetRequest(ENDPOINTS.PROJECTS.GET_ACTIVITY)).body;
}

export { getParams, getActivity };
export * from './types';
