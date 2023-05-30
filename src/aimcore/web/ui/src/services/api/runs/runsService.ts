import { TraceType } from 'services/models/runs/types';

import API from '../api';

const endpoints = {
  GET_RUNS: 'runs/search/run',
  GET_EXPERIMENTS: 'experiments',
  GET_RUN_INFO: (id: string) => `runs/${id}/info`,
  GET_RUN_LOGS: (id: string) => `runs/${id}/logs`,
  GET_RUN_METRICS_BATCH_BY_TRACES: (id: string) =>
    `runs/${id}/metric/get-batch`,
  EDIT_RUN: (id: string) => `runs/${id}`,
  ARCHIVE_RUNS: (archived: boolean) => `runs/archive-batch?archive=${archived}`,
  DELETE_RUN: (id: string) => `runs/${id}`,
  DELETE_RUNS: 'runs/delete-batch',
  ATTACH_RUNS_TAG: (id: string) => `runs/${id}/tags/new`,
  DELETE_RUNS_TAG: (id: string, tag_id: string) => `runs/${id}/tags/${tag_id}`,
  GET_BATCH: (id: string, trace: string) => `runs/${id}/${trace}/get-batch`,
  GET_BATCH_BY_STEP: (id: string, trace: string) =>
    `runs/${id}/${trace}/get-step`,
};

function getRunsData(query?: string, limit?: number, offset?: string) {
  return API.getStream<ReadableStream>(endpoints.GET_RUNS, {
    q: query || '',
    ...(limit ? { limit } : {}),
    ...(offset ? { offset } : {}),
  });
}

function getRunLogs(id: string, record_range?: string) {
  return API.getStream<ReadableStream>(endpoints.GET_RUN_LOGS(id), {
    record_range: record_range ?? '',
  });
}

function getRunInfo(id: string) {
  return API.get(endpoints.GET_RUN_INFO(id));
}

function getExperimentsData() {
  return API.get(endpoints.GET_EXPERIMENTS);
}

function getRunMetricsBatch(body: any, id: string) {
  return API.post(endpoints.GET_RUN_METRICS_BATCH_BY_TRACES(id), body);
}

function archiveRun(id: string, archived: boolean = false) {
  return API.put(endpoints.EDIT_RUN(id), { archived });
}

function editRunNameAndDescription(
  id: string,
  name: string,
  description: string,
  archived: boolean,
) {
  return API.put(endpoints.EDIT_RUN(id), { name, description, archived });
}

function archiveRuns(ids: string[], archived: boolean = false) {
  return API.post(endpoints.ARCHIVE_RUNS(archived), ids);
}

function deleteRun(id: string) {
  return API.delete(endpoints.DELETE_RUN(id));
}

function deleteRuns(ids: string[]) {
  return API.post(endpoints.DELETE_RUNS, ids);
}

function attachRunsTag(body: object, run_id: string) {
  return API.post(endpoints.ATTACH_RUNS_TAG(run_id), body);
}

function deleteRunsTag(run_id: string, tag_id: string) {
  return API.delete(endpoints.DELETE_RUNS_TAG(run_id, tag_id));
}

function getBatch(run_id: string, trace: TraceType, params: any, body: any) {
  return API.getStream1<ReadableStream>(
    endpoints.GET_BATCH(run_id, trace),
    params,
    {
      method: 'POST',
      body,
    },
  );
}

function getBatchByStep(
  run_id: string,
  trace: TraceType,
  params: any,
  body: any,
) {
  return API.getStream1<ReadableStream>(
    endpoints.GET_BATCH_BY_STEP(run_id, trace),
    params,
    {
      method: 'POST',
      body,
    },
  );
}

const runsService = {
  endpoints,
  getBatch,
  getBatchByStep,
  getRunsData,
  getRunInfo,
  getRunLogs,
  getRunMetricsBatch,
  getExperimentsData,
  archiveRun,
  deleteRun,
  attachRunsTag,
  deleteRunsTag,
  archiveRuns,
  deleteRuns,
  editRunNameAndDescription,
};

export default runsService;
