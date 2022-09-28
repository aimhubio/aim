import { createSearchRunRequest } from 'modules/core/api/runsApi';
import createResource from 'modules/core/utils/createResource';

import { IRun } from 'types/services/models/metrics/runModel';

import { parseStream } from 'utils/encoder/streamEncoding';

function createContributionsFeedEngine() {
  let { call, cancel } = createSearchRunRequest();

  const { fetchData, state } = createResource<IRun<unknown>[]>(async () =>
    parseStream(await call({ exclude_params: true, exclude_traces: true })),
  );
  return {
    fetchContributionsFeed: fetchData,
    contributionsFeedState: state,
  };
}

export default createContributionsFeedEngine();
