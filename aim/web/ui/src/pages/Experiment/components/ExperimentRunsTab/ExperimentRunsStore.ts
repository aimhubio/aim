import { createSearchRunRequest } from 'modules/core/api/runsApi';
import createResource from 'modules/core/utils/createResource';

import { RequestOptions } from 'services/NetworkService';

import { IRun } from 'types/services/models/metrics/runModel';

import { parseStream } from 'utils/encoder/streamEncoding';

function createExperimentRunsEngine() {
  const { call } = createSearchRunRequest();

  const { fetchData, state, destroy } = createResource<IRun<unknown>[]>(
    async (queryParams: RequestOptions['query_params']) =>
      parseStream(await call(queryParams)),
  );
  return {
    fetchExperimentRuns: (queryParams: RequestOptions['query_params']) =>
      fetchData(queryParams),
    experimentRunsState: state,
    destroy,
  };
}

export default createExperimentRunsEngine();
