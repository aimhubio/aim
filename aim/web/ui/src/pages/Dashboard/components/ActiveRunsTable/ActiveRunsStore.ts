import { createActiveRunsRequest } from 'modules/core/api/runsApi';
import createResource from 'modules/core/utils/createResource';

import { IRun } from 'types/services/models/metrics/runModel';

import { parseStream } from 'utils/encoder/streamEncoding';

function createActiveRunsEngine() {
  let { call } = createActiveRunsRequest();

  const { fetchData, state, destroy } = createResource<IRun<unknown>[]>(
    async () => parseStream(await call()),
  );
  return { fetchActiveRuns: fetchData, activeRunsState: state, destroy };
}

export default createActiveRunsEngine();
