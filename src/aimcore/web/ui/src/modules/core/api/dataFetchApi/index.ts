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
      await api.makeAPIGetRequest(ENDPOINTS.DATA.FETCH, {
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
      await api.makeAPIGetRequest(ENDPOINTS.DATA.GET_GROUPED_SEQUENCES, {
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

function createRunFunctionRequest(): RequestInstance {
  const controller = new AbortController();
  const signal = controller.signal;

  async function call(
    action_name: string,
    request_data: Record<string, any>,
  ): Promise<any> {
    return await api.makeAPIPostRequest(ENDPOINTS.DATA.RUN, {
      query_params: {
        action_name,
      },
      body: request_data,
      signal,
    });
  }

  function cancel(): void {
    controller.abort();
  }

  return {
    call,
    cancel,
  };
}

function createBlobsRequest(): RequestInstance {
  const controller = new AbortController();
  const signal = controller.signal;

  async function call(uris: string[]): Promise<any> {
    return (
      await api.makeAPIPostRequest(ENDPOINTS.DATA.FETCH_BLOBS, {
        body: uris,
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

function createFindDataRequest(isContainer: boolean = true): RequestInstance {
  const controller = new AbortController();
  const signal = controller.signal;

  async function call(queryParams: any): Promise<any> {
    return (
      await api.makeAPIGetRequest(
        isContainer
          ? ENDPOINTS.DATA.FIND_CONTAINER
          : ENDPOINTS.DATA.FIND_SEQUENCE,
        {
          query_params: queryParams,
          signal,
        },
      )
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

export {
  createFetchDataRequest,
  createFetchGroupedSequencesRequest,
  createRunFunctionRequest,
  createBlobsRequest,
  createFindDataRequest,
};
