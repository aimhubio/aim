import API from '../api';

const endpoints = {
  GET_RUNS: 'runs/search/run',
  GET_RUN_INFO: (id: string) => `runs/${id}/info`,
  GET_RUN_BATCH_BY_TRACES: (id: string) => `runs/${id}/traces/get-batch`,
  ARCHIVE_RUN: (id: string) => `runs/${id}`,
  CREATE_RUNS_TAG: (id: string) => `runs/${id}/tags/new`,
  DELETE_RUNS_TAG: (id: string, tag_id: string) => `runs/${id}/tags/${tag_id}`,
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

function getRunBatch(body: any, id: string) {
  return API.post(endpoints.GET_RUN_BATCH_BY_TRACES(id), body, {
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

const runsService = {
  endpoints,
  getRunsData,
  getRunInfo,
  getRunBatch,
  archiveRun,
  createRunsTag,
  deleteRunsTag,
};

export default runsService;
