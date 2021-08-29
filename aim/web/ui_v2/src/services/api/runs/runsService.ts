import API from '../api';

const endpoints = {
  GET_RUNS: 'runs/search/run',
  GET_RUN_INFO: (id: string) => `runs/${id}/info`,
  GET_RUN_BATCH_BY_TRACES: (id: string) => `runs/${id}/traces/get-batch`,
  ARCHIVE_RUN: (id: string) => `runs/${id}`,
};

function getRunsData(query?: string) {
  return API.getStream<ReadableStream>(endpoints.GET_RUNS, {
    q: query || 'True',
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

const runsService = {
  endpoints,
  getRunsData,
  getRunInfo,
  getRunBatch,
  archiveRun,
};

export default runsService;
