import { IExperimentData } from 'modules/core/api/experimentsApi';

import { IApiRequest } from 'types/services/services';

import API from '../api';

const endpoints = {
  EXPERIMENTS: 'experiments',
  GET_EXPERIMENT_BY_ID: (id: string) => `experiments/${id}`,
  UPDATE_EXPERIMENT_BY_ID: (id: string) => `experiments/${id}`,
  SEARCH_EXPERIMENT: (query: string) => `experiments/search=${query}`,
  GET_RUNS_BY_EXPERIMENT_ID: (id: string) => `experiments/${id}/runs`,
};

function getExperimentsData(): IApiRequest<IExperimentData[]> {
  return API.get(endpoints.EXPERIMENTS);
}

function searchExperiment(query: string): IApiRequest<IExperimentData> {
  return API.get(endpoints.SEARCH_EXPERIMENT(query));
}

function getExperimentById(id: string): IApiRequest<IExperimentData> {
  return API.get(endpoints.GET_EXPERIMENT_BY_ID(id));
}

function updateExperimentById(
  reqBody: { name?: string; archived?: boolean },
  id: string,
): IApiRequest<{ status: string; id: string }> {
  return API.put(endpoints.UPDATE_EXPERIMENT_BY_ID(id), reqBody);
}

function createExperiment(reqBody: {
  name: string;
}): IApiRequest<{ id: string; status: string }> {
  return API.post(endpoints.EXPERIMENTS, reqBody);
}

function getRunsOfExperiment(
  id: string,
  params: { limit: number; offset?: string } = { limit: 10 },
) {
  return API.get(endpoints.GET_RUNS_BY_EXPERIMENT_ID(id), params);
}

const experimentsService = {
  endpoints,
  getExperimentsData,
  searchExperiment,
  getExperimentById,
  updateExperimentById,
  createExperiment,
  getRunsOfExperiment,
};

export default experimentsService;
