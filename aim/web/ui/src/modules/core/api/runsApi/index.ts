import { getAPIHost } from 'config/config';

import ENDPOINTS from 'services/api/endpoints';
import NetworkService, { RequestInstance } from 'services/NetworkService';

import { SequenceTypesEnum } from 'types/core/enums';

import { RunsSearchQueryParams, RunsSearchResult } from './types';

const api = new NetworkService(`${getAPIHost()}${ENDPOINTS.RUNS.BASE}`);

/**
 * function searchRuns
 * this call is used for getting explorer' data
 * @param sequenceType - sequence name
 * @param queryParams
 */
async function searchRuns(
  sequenceType: SequenceTypesEnum,
  queryParams: RunsSearchQueryParams,
): Promise<RunsSearchResult> {
  return (
    await api.makeAPIGetRequest(`${ENDPOINTS.RUNS.SEARCH}/${sequenceType}`, {
      query_params: queryParams,
    })
  ).body;
}

function createSearchRunsRequest(
  sequenceType: SequenceTypesEnum,
): RequestInstance {
  const controller = new AbortController();
  const signal = controller.signal;

  async function call(
    queryParams: RunsSearchQueryParams,
  ): Promise<RunsSearchResult> {
    return (
      await api.makeAPIGetRequest(`${ENDPOINTS.RUNS.SEARCH}/${sequenceType}`, {
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

function createSearchRunRequest(): RequestInstance {
  const controller = new AbortController();
  const signal = controller.signal;

  async function call(
    queryParams: RunsSearchQueryParams,
  ): Promise<RunsSearchResult> {
    return (
      await api.makeAPIGetRequest(`${ENDPOINTS.RUNS.SEARCH}/run`, {
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

function createRunLogRecordsRequest(): RequestInstance {
  const controller = new AbortController();
  const signal = controller.signal;

  async function call(
    runId: string,
    record_range?: string,
  ): Promise<RunsSearchResult> {
    return (
      await api.makeAPIGetRequest(`${runId}/log-records`, {
        query_params: record_range ? { record_range } : {},
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

function createBlobsRequest(
  sequenceType: `${SequenceTypesEnum}`,
): RequestInstance {
  const controller = new AbortController();
  const signal = controller.signal;

  async function call(uris: string[]): Promise<RunsSearchResult> {
    return (
      await api.makeAPIPostRequest(`${sequenceType}/get-batch`, {
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

function createActiveRunsRequest(): RequestInstance {
  const controller = new AbortController();
  const signal = controller.signal;

  async function call(
    queryParams: RunsSearchQueryParams,
  ): Promise<RunsSearchResult> {
    return (
      await api.makeAPIGetRequest(`${ENDPOINTS.RUNS.ACTIVE}`, {
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

export {
  searchRuns,
  createSearchRunsRequest,
  createActiveRunsRequest,
  createSearchRunRequest,
  createBlobsRequest,
  createRunLogRecordsRequest,
};
export * from './types';
