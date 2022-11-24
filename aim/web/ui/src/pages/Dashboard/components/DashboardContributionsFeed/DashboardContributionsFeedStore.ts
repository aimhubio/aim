import { createSearchRunRequest } from 'modules/core/api/runsApi';
import createResource from 'modules/core/utils/createResource';

import { RequestOptions } from 'services/NetworkService';

import { IRun } from 'types/services/models/metrics/runModel';

import { parseStream } from 'utils/encoder/streamEncoding';

function createDashboardContributionsFeedEngine() {
  let { call } = createSearchRunRequest();

  const { fetchData, state, destroy } = createResource<IRun<unknown>[]>(
    async (queryParams: RequestOptions['query_params']) =>
      parseStream(await call(queryParams)),
  );
  return {
    fetchContributionsFeed: (queryParams: RequestOptions['query_params']) =>
      fetchData(queryParams),
    contributionsFeedState: state,
    destroy,
  };
}

export default createDashboardContributionsFeedEngine();
