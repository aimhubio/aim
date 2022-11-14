import { getAPIHost } from 'config/config';

import ENDPOINTS from 'services/api/endpoints';
import NetworkService, { RequestInstance } from 'services/NetworkService';

import {
  ExperimentRunsSearchQueryParams,
  GetExperimentContributionsResult,
  IExperimentData,
} from './types';

const api = new NetworkService(`${getAPIHost()}${ENDPOINTS.EXPERIMENTS.BASE}`);

/**
 * function getExperiments
 * this call is used for fetching experiments data.
 * @returns {Promise<IExperimentData[]>}
 */
async function getExperiments(): Promise<IExperimentData[]> {
  return (await api.makeAPIGetRequest(ENDPOINTS.EXPERIMENTS.GET)).body;
}

/**
 * function searchExperiments
 * this call is used for searching experiment data.
 * @param query - query string
 * @returns {Promise<IExperimentData>}
 */
async function searchExperiment(query: string): Promise<IExperimentData> {
  return (
    await api.makeAPIGetRequest(`${ENDPOINTS.EXPERIMENTS.SEARCH}=${query}`)
  ).body;
}

/**
 * function getExperimentById
 * this call is used for fetching experiment data by id.
 * @param id - experiment id
 * @returns {Promise<IExperimentData>}
 */
async function getExperimentById(id: string): Promise<IExperimentData> {
  return (await api.makeAPIGetRequest(`${ENDPOINTS.EXPERIMENTS.GET}${id}`))
    .body;
}

/**
 * function getExperimentById
 * this call is used for updating experiment data by id.
 * @param id - experiment id
 * @param reqBody - query body params
 * @returns {Promise<status: string, id: string>}
 */
async function updateExperimentById(
  reqBody: { name?: string; archived?: boolean },
  id: string,
): Promise<{ status: string; id: string }> {
  return (
    await api.makeAPIPutRequest(`${ENDPOINTS.EXPERIMENTS.GET}${id}`, {
      body: reqBody,
    })
  ).body;
}

/**
 * function getExperimentById
 * this call is used for updating experiment data by id.
 * @param  reqBody -  query body params
 * @returns {Promise<status: string, id: string>}
 */
async function createExperiment(reqBody: {
  name: string;
}): Promise<{ id: string; status: string }> {
  return (
    await api.makeAPIPostRequest(ENDPOINTS.EXPERIMENTS.CREATE, {
      body: reqBody,
    })
  ).body;
}

/**
 * function getExperimentById
 * this call is used for updating experiment data by id.
 * @param { id, params } - query params
 * @returns {Promise<status: string, id: string>}
 */
async function getRunsOfExperiment(
  id: string,
  params: { limit: number; offset?: string } = { limit: 10 },
) {
  return await api.makeAPIGetRequest(`${ENDPOINTS.EXPERIMENTS.GET}${id}/runs`, {
    query_params: params,
  });
}

/**
 * function getProjectContributions
 * this call is used from DashboardPage page to show project contributions data
 */
async function getExperimentContributions(
  id: string,
): Promise<GetExperimentContributionsResult> {
  return (
    await api.makeAPIGetRequest(`${id}/${ENDPOINTS.EXPERIMENTS.GET_ACTIVITY}`)
  ).body;
}

function createSearchExperimentRunsRequest(): RequestInstance {
  const controller = new AbortController();
  const signal = controller.signal;

  async function call({
    experimentId,
    queryParams,
  }: {
    experimentId: string;
    queryParams: ExperimentRunsSearchQueryParams;
  }): Promise<any> {
    return (
      await api.makeAPIGetRequest(
        `${ENDPOINTS.EXPERIMENTS.GET}${experimentId}/runs`,
        {
          query_params: queryParams,
          signal,
        },
      )
    ).body.runs;
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
  getExperiments,
  searchExperiment,
  getExperimentById,
  updateExperimentById,
  createExperiment,
  getRunsOfExperiment,
  getExperimentContributions,
  createSearchExperimentRunsRequest,
};
export * from './types';
