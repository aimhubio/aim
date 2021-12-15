import { TraceType } from 'services/models/runs/types';

import API from '../api';

const endpoints = {
  GET_RUNS: 'runs/search/run',
  GET_EXPERIMENTS: 'experiments',
  GET_RUN_INFO: (id: string) => `runs/${id}/info`,
  GET_RUNS_BY_EXPERIMENT_ID: (id: string) => `experiments/${id}/runs`,
  GET_RUN_METRICS_BATCH_BY_TRACES: (id: string) =>
    `runs/${id}/metric/get-batch`,
  ARCHIVE_RUN: (id: string) => `runs/${id}`,
  CREATE_RUNS_TAG: (id: string) => `runs/${id}/tags/new`,
  DELETE_RUNS_TAG: (id: string, tag_id: string) => `runs/${id}/tags/${tag_id}`,
  GET_BATCH: (id: string, trace: string) => `runs/${id}/${trace}/get-batch`,
};

function getRunsData(query?: string, limit?: number, offset?: string) {
  return API.getStream<ReadableStream>(endpoints.GET_RUNS, {
    q: query || '',
    ...(limit ? { limit } : {}),
    ...(offset ? { offset } : {}),
  });
}

function getRunInfo(id: string) {
  return API.get(endpoints.GET_RUN_INFO(id));
}

function getRunsOfExperiment(
  id: string,
  params: { limit: number; offset?: string } = { limit: 10 },
) {
  return API.get(endpoints.GET_RUNS_BY_EXPERIMENT_ID(id), params);
}

function getExperimentsData() {
  return API.get(endpoints.GET_EXPERIMENTS);
}

function getRunMetricsBatch(body: any, id: string) {
  return API.post(endpoints.GET_RUN_METRICS_BATCH_BY_TRACES(id), body, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function archiveRun(id: string, archived: boolean = false) {
  return API.put(
    endpoints.ARCHIVE_RUN(id),
    { archived },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

function createRunsTag(body: object, run_id: string) {
  return API.post(endpoints.CREATE_RUNS_TAG(run_id), body, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function deleteRunsTag(run_id: string, tag_id: string) {
  return API.delete(endpoints.DELETE_RUNS_TAG(run_id, tag_id), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getBatch(run_id: string, trace: TraceType, params: any, body: any) {
  return API.getStream1<ReadableStream>(
    endpoints.GET_BATCH(run_id, trace),
    params,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    },
  );
}

const runsService = {
  endpoints,
  getBatch,
  getRunsData,
  getRunInfo,
  getRunMetricsBatch,
  getExperimentsData,
  getRunsOfExperiment,
  archiveRun,
  createRunsTag,
  deleteRunsTag,
};

export default runsService;
