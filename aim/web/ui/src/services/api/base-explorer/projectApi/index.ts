import { getAPIHost } from 'config/config';

import ENDPOINTS from 'services/api/endpoints';
import NetworkService from 'services/NetworkService';

import { GetParamsOptions, GetParamsResult } from './types';

const api = new NetworkService(`${getAPIHost()}${ENDPOINTS.PROJECTS.BASE}`);

function getParams(options: GetParamsOptions): Promise<GetParamsResult> {
  return api.makeAPIGetRequest<GetParamsResult>(
    ENDPOINTS.PROJECTS.GET_PARAMS,
    options,
  );
}

export { getParams };
export * from './types';
