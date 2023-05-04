import { getAPIHost } from 'config/config';

import ENDPOINTS from 'services/api/endpoints';
import NetworkService, { RequestInstance } from 'services/NetworkService';

const api = new NetworkService(`${getAPIHost()}${ENDPOINTS.DATA.BASE}`);

function createFetchDataRequest(): RequestInstance {
  const controller = new AbortController();
  const signal = controller.signal;

  async function call(queryParams: any): Promise<any> {
    return (
      await api.makeAPIGetRequest(`${ENDPOINTS.DATA.FETCH}`, {
        query_params: queryParams,
        signal,
      })
    ).body;
  }

  function cancel(): void {
    controller.abort();
  }

  return {
    call,
    cancel,
  };
}

export { createFetchDataRequest };
