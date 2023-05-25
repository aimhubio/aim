import { getAPIHost } from 'config/config';

import ENDPOINTS from 'services/api/endpoints';
import NetworkService, { RequestInstance } from 'services/NetworkService';

import { SequenceType } from 'types/core/enums';

import { GroupedSequencesSearchQueryParams } from './types';

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

function createFetchGroupedSequencesRequest(
  sequenceType: SequenceType,
  cont_type: string,
): RequestInstance {
  const controller = new AbortController();
  const signal = controller.signal;

  async function call(
    queryParams: GroupedSequencesSearchQueryParams,
  ): Promise<ReadableStream> {
    return (
      await api.makeAPIGetRequest(`${ENDPOINTS.DATA.GET_GROUPED_SEQUENCES}`, {
        query_params: {
          seq_type: sequenceType,
          cont_type,
          ...queryParams,
        },
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

export { createFetchDataRequest, createFetchGroupedSequencesRequest };
