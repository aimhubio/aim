import { createSearchRunRequest } from 'modules/core/api/runsApi';
import createResource from 'modules/core/utils/createResource';

import { IRun } from 'types/services/models/metrics/runModel';

import { parseStream } from 'utils/encoder/streamEncoding';

function createActiveRunsEngine() {
  let { call, cancel } = createSearchRunRequest();

  const { fetchData, state } = createResource<IRun<unknown>[]>(async () =>
    parseStream(await call({ q: 'run.active == True', exclude_params: true })),
  );
  return { fetchActiveRuns: fetchData, activeRunsState: state };
}

export default createActiveRunsEngine();
